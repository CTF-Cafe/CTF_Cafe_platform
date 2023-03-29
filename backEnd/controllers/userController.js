const users = require("../models/userModel");
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
  const username = req.body.username.trim();
  const password = req.body.password.trim();

  const user = await users.findOne({ username: username });

  if (user) {
    if (user.verified) {
      if (await encryptionController.compare(password, user.password)) {
        const newKey = v4();

        req.session.userId = user._id.toString();
        req.session.key = newKey;
        user.password = undefined;
        await users.updateOne(
          { username: username },
          { key: newKey.toString() }
        );

        // Create log for admins
        logController.createLog(req, user, {
          state: "success",
          message: "Logged In",
        });

        res.send({ state: "success", message: "Logged In", user: user });
      } else {
        logController.createLog(req, user, {
          state: "error",
          message: "Wrong Credentials",
        });

        res.send({ state: "error", message: "Wrong Credentials" });
      }
    } else {
      res.send({ state: "error", message: "Verify email first!" });
    }
  } else {
    res.send({ state: "error", message: "Wrong Credentials" });
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
    if (
      req.body.username_old.trim() != req.body.username.trim() ||
      req.body.password_old.trim() != req.body.password.trim()
    ) {
      throw new Error("Please dont use any 'sus' character's");
    }

    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = await encryptionController.encrypt(
      req.body.password.trim()
    );

    // const startTime = await ctfConfig.findOne({ name: "startTime" });

    // Check if CTF has started
    // if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) <= 0) {
    //     throw new Error('Registrations are closed!');
    // }

    // Username to short
    if (username.length < 4)
      throw new Error("Username is to short! 4 characters minimum!");

    // Username to long
    if (username.length > 32)
      throw new Error("Username is to long! 32 characters maximum!");

    // Check password length
    if (req.body.password.trim().length < 8)
      throw new Error("Password is to short 8 characters minimum!!");

    if (
      !email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    )
      throw new Error("Invalid email!");

    // Check if username exists
    const userExists = await users.findOne({ username: username });

    if (userExists) throw new Error("User name Exists!");

    // Check admin has deleted the admin:admin account before allowing others.
    const defaultAdminCheck = await users.findOne({
      username: "admin",
      password: "admin",
      isAdmin: true,
    });

    // COOMMENTED OUT UNTIL WE ADD PASSWORD CHANGE FUNCTIONALITY

    // if (defaultAdminCheck) {
    //     throw new Error('Change the default admins password first!');
    // }

    // Create new User
    const newKey = v4();

    await users
      .create({
        username: username,
        password: password,
        email: email,
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
          res.send({ state: "success", message: "Registered" });
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
};

exports.verifyMail = async function (req, res) {
  try {
    const user = await users.findOne({ _id: req.params.id });
    if (!user) throw new Error("Invalid Link");

    if (user.token != req.params.token) throw new Error("Invalid Link");

    await users.updateOne({ _id: user._id }, { verified: true, token: "" });

    res.send("Email verified!");
  } catch (err) {
    if (err) {
      res.send(err.message);
    }
  }
};

exports.updateUsername = async function (req, res) {
  try {
    const username = req.body.newUsername.trim();

    // Username to short
    if (username.length < 4) {
      throw new Error("Username is to short! 4 characters minimum!");
    }

    // Username to long
    if (username.length > 32) {
      throw new Error("Username is to long! 32 characters maximum!");
    }

    // Check if username exists
    const userExists = await users.findOne({
      username: username,
      verified: true,
    });

    if (userExists) {
      throw new Error("User name Exists!");
    }

    await users
      .findByIdAndUpdate(req.session.userId,
        { username: username },
        { returnOriginal: false }
      )
      .then(async function (user) {
        if (ObjectId.isValid(user.teamId)) {
          userTeamExists = await teams.findById(user.teamId);

          if (userTeamExists) {
            let newUsers = userTeamExists.users;
            let captain = userTeamExists.teamCaptain;
            newUsers.forEach((userInTeam) => {
              if (userInTeam._id.equals(user._id)) {
                userInTeam.username = username;
              }
            });

            if (captain == req.session.userId) {
              await teams
                .findByIdAndUpdate(
                  user.teamId,
                  { users: newUsers, teamCaptain: req.session.userId },
                  { returnOriginal: false }
                )
                .then(async function (team) {
                  user.password = undefined;
                  res.send({
                    state: "success",
                    message: "Username updated!",
                    user: user,
                    team: team,
                  });
                });
            } else {
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
                    user: user,
                    team: team,
                  });
                });
            }
          }
        } else {
          res.send({
            state: "success",
            message: "Username updated!",
            user: user,
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

exports.getUsers = async function (req, res) {
  let page = req.body.page;
  let search = req.body.search;

  if (page <= 0) {
    res.send({ state: "error", message: "Page cannot be less than 1!" });
  } else {
    let userCount = await users.count();
    if ((page - 1) * 100 > userCount) {
      res.send({ state: "error", message: "No more pages!" });
    } else {
      if (isNaN(page)) {
        page = 1;
      }

      let allUsers = [];
      try {
        allUsers = await dbController
          .resolveUsers({
            username: new RegExp(search, "i"),
            verified: true,
            $or: [{ _id: req.session.userId }, { shadowBanned: false }],
          })
          .sort({ score: -1, _id: 1 })
          .skip((page - 1) * 100)
          .limit(100);

        res.send(allUsers);

        // allUsers = await users.find({}).sort({ score: -1, _id: 1 }).skip((page - 1) * 100).limit(100);
      } catch (err) {
        console.log(err);
        res.send({ state: "error", message: err.message });
      }
    }
  }
};

exports.getUser = async function (req, res) {
  let user = await users.findOne({
    username: decodeURIComponent(req.body.username.trim()),
    verified: true,
  });

  if (user) {
    user.password = "Nice try XD";
    user.key = "Nice try XD";
    user.isAdmin = false;
    user.score = 0;

    // Fetch Challenges from solves
    for (let i = 0; i < user.solved.length; i++) {
      let challenge = await challenges.findById(user.solved[i]._id, {
        _id: 1,
        name: 1,
        category: 1,
        points: 1,
        firstBlood: 1,
        firstBloodPoints: 1,
      });
      if (challenge) {
        user.solved[i].challenge = challenge;
        if (user._id.equals(challenge.firstBlood))
          user.score += challenge.firstBloodPoints;
        user.score += challenge.points;
      } else {
        user.solved.splice(i, 1);
        i--;
      }
    }

    // Fetch challenges from hintsBought
    for (let i = 0; i < user.hintsBought.length; i++) {
      let challenge = await challenges.findById(user.hintsBought[i].challId, {
        _id: 1,
        name: 1,
        hints: 1,
      });
      if (challenge) {
        user.hintsBought[i].challName = challenge.name;

        let hint = undefined;
        if (
          (hint = challenge.hints.find(
            (x) => x.id == user.hintsBought[i].hintId
          ))
        ) {
          user.hintsBought[i].cost = hint.cost;
        }
      } else {
        user.hintsBought.splice(i, 1);
        i--;
      }
    }

    for (let i = 0; i < user.hintsBought.length; i++) {
      user.score -= user.hintsBought[i].cost;
    }

    res.send(user);
  } else {
    res.send({ state: "error", message: "User not found" });
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
  let allTeams = await dbController
    .resolveTeamsMin({
      users: { $not: { $elemMatch: { shadowBanned: true } } },
    })
    .sort({ totalScore: -1, maxTimestamp: -1, _id: 1 });

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
