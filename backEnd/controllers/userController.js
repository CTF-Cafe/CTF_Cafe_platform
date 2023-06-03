const { validationResult, matchedData } = require("express-validator");
const Users = require("../models/userModel");
const { v4 } = require("uuid");
const ctfConfig = require("../models/ctfConfigModel.js");
const theme = require("../models/themeModel.js");
const teams = require("../models/teamModel.js");
const challenges = require("../models/challengeModel.js");
const encryptionController = require("./encryptionController.js");
const logController = require("./logController.js");
const ObjectId = require("mongoose").Types.ObjectId;
const nodemailer = require("nodemailer");
const dbController = require("./dbController");

exports.login = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const username = data.username;
    const password = data.password;

    const user = await Users.findOne({ username: username });

    if (!user) {
      throw new Error("Wrong Credentials");
    }

    if (!user.verified) {
      throw new Error("Verify email first!");
    }

    if (!(await encryptionController.compare(password, user.password))) {
      logController.createLog(req, user, {
        state: "error",
        message: "Wrong Credentials",
      });

      throw new Error("Wrong Credentials");
    }

    const newKey = v4();

    req.session.userId = user._id.toString();
    req.session.key = newKey;
    user.password = undefined;
    await Users.updateOne({ username: username }, { key: newKey.toString() });

    // Create log for admins
    logController.createLog(req, user, {
      state: "success",
      message: "Logged In",
    });

    res.send({ state: "success", message: "Logged In" });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.logout = async function (req, res) {
  req.session.userId = undefined;
  req.session.key = undefined;
  res.sendStatus(200);
};

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.register = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const username = data.username;
    const email = data.email;
    const password = await encryptionController.encrypt(data.password);
    const userCategory = data.userCategory;

    // const startTime = await ctfConfig.findOne({ name: "startTime" });

    // Check if CTF has started
    // if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) <= 0) {
    //     throw new Error('Registrations are closed!');
    // }

    const userCategories = (await ctfConfig.findOne({ name: "userCategories" }))
      .value;

    if (!userCategories.find((x) => x === userCategory))
      throw new Error("User Category does not exist!");

    // Check if username exists
    const userExists = await Users.findOne({ username: username });

    if (userExists) throw new Error("User name Exists!");

    // Check admin has deleted the admin:admin account before allowing others.
    // const defaultAdminCheck = await Users.findOne({
    //   username: "admin",
    //   password: "admin",
    //   isAdmin: true,
    // });

    // COOMMENTED OUT UNTIL WE ADD PASSWORD CHANGE FUNCTIONALITY

    // if (defaultAdminCheck) {
    //     throw new Error('Change the default admins password first!');
    // }

    // Create new User
    const newKey = v4();

    await Users.create({
      username: username,
      password: password,
      email: email,
      category: userCategory,
      key: newKey.toString(),
      isAdmin: false,
      verified: process.env.MAIL_VERIFICATION == "true" ? false : true,
      token: process.env.MAIL_VERIFICATION == "true" ? v4() : "",
    })
      .then(async function (user) {
        if (process.env.MAIL_VERIFICATION == "true") {
          const message = `Verify your email : ${process.env.BACKEND_URI}/api/verify/${user._id}/${user.token}`;
          await sendEmail(user.email, "Verify Email CTF", message);

          res.send({
            state: "success",
            message: "Registered! Now verify email!",
          });
        } else {
          req.session.userId = user._id.toString();
          req.session.key = newKey.toString();

          res.send({ state: "success", message: "Registered", verified: true });
        }
      })
      .catch(function (err) {
        throw new Error("User creation failed!");
      });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }

  // RESPONSE PHASE END
};

exports.verifyMail = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const user = await Users.findById(data.id);
    if (!user) throw new Error("Invalid Link");

    if (user.token !== req.params.token) throw new Error("Invalid Link");

    await Users.updateOne({ _id: user._id }, { verified: true, token: "" });

    res.send("Email verified! You can now Login!");
  } catch (err) {
    if (err) {
      res.send(err.message);
    }
  }
};

exports.updateUsername = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const username = data.newUsername;

    // Check if username exists
    const userExists = await Users.findOne({
      username: username,
      verified: true,
    });

    if (userExists) {
      throw new Error("User name Exists!");
    }

    await Users.findByIdAndUpdate(
      req.session.userId,
      { username: username },
      { returnOriginal: false }
    )
      .then(async function (user) {
        if (ObjectId.isValid(user.teamId)) {
          let userTeamExists = await teams.findById(user.teamId);

          if (userTeamExists) {
            let newUsers = userTeamExists.users;

            newUsers.forEach((userInTeam) => {
              if (userInTeam._id.equals(user._id)) {
                userInTeam.username = username;
              }
            });

            await teams
              .findByIdAndUpdate(
                user.teamId,
                { users: newUsers },
                { returnOriginal: false }
              )
              .then(async function (team) {
                user.password = undefined;
                res.send({
                  state: "success",
                  message: "Username updated!",
                });
              });
          }
        } else {
          res.send({
            state: "success",
            message: "Username updated!",
          });
        }
      })
      .catch(function (err) {
        console.log(err.message);
        throw new Error("User update failed!");
      });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.updatePassword = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const newPassword = data.newPassword;
    const oldPassword = data.oldPassword;

    const user = await Users.findById(req.session.userId);

    if (!user) {
      throw new Error("Wrong Credentials");
    }

    if (!(await encryptionController.compare(oldPassword, user.password))) {
      throw new Error("Wrong Credentials");
    }

    await Users.findByIdAndUpdate(
      req.session.userId,
      { password: await encryptionController.encrypt(newPassword) },
      { returnOriginal: false }
    ).catch(function (err) {
      console.log(err.message);
      throw new Error("User update failed!");
    });

    res.send({
      state: "success",
      message: "Password updated!",
    });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.getUsers = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    let page = data.page;
    let search = data.search;
    let userCategory = req.body.category;

    const userToCheck = await Users.findById(req.session.userId);
    if (!userToCheck || !userToCheck.isAdmin) {
      // DONT SEND USERS IF SCOREBOARD HIDDEN AND NOT ADMIN
      const scoreboardHidden = await ctfConfig.findOne({
        name: "scoreboardHidden",
      });
      if (scoreboardHidden.value) {
        res.send({ state: "error", message: "Scoreboard is Hidden!" });
        return;
      }
    }

    const userCategories = (await ctfConfig.findOne({ name: "userCategories" }))
      .value;

    if (userCategory && !userCategories.find((x) => x === userCategory))
      throw new Error("User Category does not exist!");

    let userCount = await Users.count();
    if ((page - 1) * 100 > userCount) {
      throw new Error("No more pages!");
    }

    let allUsers = [];
    allUsers = await dbController
      .resolveUsers({
        category: userCategory ? userCategory : { $exists: true },
        username: new RegExp(search, "i"),
        verified: true,
        $or: [{ _id: req.session.userId }, { shadowBanned: false }],
      })
      .sort({ score: -1, _id: 1 })
      .skip((page - 1) * 100)
      .limit(100);

    res.send(allUsers);
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.getUser = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const username = data.username;

    const users = await dbController.resolveUsers({
      username: username,
      verified: true,
      $or: [{ _id: req.session.userId }, { shadowBanned: false }],
    });

    if (!users[0]) {
      throw new Error("User not found!");
    }

    const user = users[0];

    if (!user._id.equals(req.session.userId)) {
      const userToCheck = await Users.findById(req.session.userId);
      if (!userToCheck || !userToCheck.isAdmin) {
        // DONT SEND USER IF SCOREBOARD HIDDEN AND ITS NOT THE USER HIMSELF OR ADMIN
        const scoreboardHidden = await ctfConfig.findOne({
          name: "scoreboardHidden",
        });
        if (scoreboardHidden.value) {
          throw new Error("Scoreboard is Hidden!");
        }
      }
    }

    res.send(user);
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.getEndTime = async function (req, res) {
  const endTime = await ctfConfig.findOne({ name: "endTime" });

  res.send(endTime.value.toString());
};

exports.getConfigs = async function (req, res) {
  const configs = await ctfConfig.find({});

  res.send(configs);
};

exports.getTheme = async function (req, res) {
  const currentTheme = await theme.findOne({});

  if (currentTheme) {
    res.send({ state: "success", theme: currentTheme });
  } else {
    res.send({ state: "error", message: "No Theme!" });
  }
};

exports.getScoreboard = async function (req, res) {
  const scoreboardHidden = await ctfConfig.findOne({
    name: "scoreboardHidden",
  });

  if (scoreboardHidden.value) {
    res.send({ state: "error", message: "Scoreboard is Hidden!" });
    return;
  }

  let allTeams = await dbController
    .resolveTeamsMin({
      users: { $not: { $elemMatch: { shadowBanned: true } } },
    })
    .sort({ totalScore: -1, maxTimestamp: 1, _id: 1 });

  let finalData = {
    standings: [],
  };

  for (let i = 0; i < allTeams.length; i++) {
    if (allTeams[i].totalScore > 0) {
      finalData.standings.push({
        pos: i + 1,
        team: allTeams[i].name,
        score: allTeams[i].totalScore,
      });
    }
  }

  res.send(finalData);
};

// {
//     "standings": [
//         { "pos": 1, "team": "Intergalactic Pwners", "score": 1700 },
//         { "pos": 2, "team": "h4ckmeifyouc4n", "score": 1200 },
//         { "pos": 3, "team": "MV Tech", "score": 100 }
//     ]
// }

exports.getTeamCount = async function (req, res) {
  let teamsCount = await teams.countDocuments({});
  res.send({ state: "success", count: teamsCount });
};
