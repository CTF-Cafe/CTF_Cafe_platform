const users = require("../models/userModel");
const teams = require("../models/teamModel");
const challenges = require("../models/challengeModel.js");
const ctfConfig = require("../models/ctfConfigModel.js");
const theme = require("../models/themeModel.js");
const log = require("../models/logModel.js");
const path = require("path");
const fs = require("fs");
const ObjectId = require("mongoose").Types.ObjectId;
const axios = require("axios");

exports.getStats = async function (req, res) {
  let allChallenges = await challenges.find({}).sort({ points: 1 });

  switch (req.body.name) {
    case "counts":
      let finalObject = {};
      finalObject.usersCount = await users.countDocuments({});
      finalObject.teamsCount = await teams.countDocuments({});
      finalObject.challengesCount = await challenges.countDocuments({});

      res.send(finalObject);
      break;
    case "challenges":
      res.send(allChallenges);
      break;
    case "challenges&categories":
      let categories = [];

      await allChallenges.forEach((challenge) => {
        if (categories.indexOf(challenge.category) == -1)
          categories.push(challenge.category);
      });

      res.send({
        categories: categories,
        challenges: allChallenges,
        state: "success",
      });
      break;
    default:
      res.send([]);
      break;
  }
};

exports.saveChallenge = async function (req, res) {
  try {
    const challengeExists = await challenges.findById(req.body.id);

    if (isNaN(req.body.points)) throw Error("points must be a number!");

    if (parseInt(req.body.points) < 0 || parseInt(req.body.level) < 0)
      throw Error("Points and level must be positive numbers");

    if (isNaN(req.body.firstBloodPoints))
      throw Error("firstBloodPoints must be a number!");

    if (parseInt(req.body.firstBloodPoints) < 0)
      throw Error("firstBloodPoints must be positive number");

    req.body.hints = JSON.parse(req.body.hints).map((hint) => {
      if (!hint.cost) throw Error("hint must have a cost!");
      if (!hint.content) throw Error("hint must have some content!");
      if (!hint.id) throw Error("hint must have an id!");
      if (isNaN(hint.cost)) throw Error("hint cost must be a number!");
      if (parseInt(hint.cost) < 0)
        throw Error("hint cost must be a positive number");
      return { id: hint.id, content: hint.content, cost: parseInt(hint.cost) };
    });

    if (req.body.name.length < 1) throw Error("Name cannot be empty");

    if (req.body.info.length < 1) throw Error("Info cannot be empty");

    if (req.body.flag.length < 1) throw Error("Flag cannot be empty");

    if (req.body.requirement != '' && !ObjectId.isValid(req.body.requirement)) throw Error("Requirement must be a valid ObjectId!");

    if (!challengeExists) throw Error("Challenge does not exist");

    await challenges.findByIdAndUpdate(req.body.id, {
      hidden: req.body.hidden == "true" ? true : false,
      name: req.body.name.trim(),
      points: parseInt(req.body.points),
      firstBloodPoints: parseInt(req.body.firstBloodPoints),
      initialPoints: parseInt(req.body.points),
      minimumPoints: parseInt(req.body.minimumPoints),
      level: parseInt(req.body.level),
      info: req.body.info,
      hints: req.body.hints,
      flag: req.body.flag.trim(),
      file: req.body.file.length > 0 ? req.body.file : "",
      codeSnippet: req.body.codeSnippet.length > 0 ? req.body.codeSnippet : "",
      githubUrl: req.body.githubUrl.trim(),
      isInstance: req.body.isInstance == "true",
      codeLanguage: req.body.codeLanguage,
      randomFlag: req.body.randomFlag == "true" ? true : false,
      requirement: req.body.requirement
    });
    res.send({ state: "success", message: "Challenge Updated!" });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.createChallenge = async function (req, res) {
  if (req.body.category.length < 1) {
    res.send({ state: "error", message: "Category cannot be empty" });
    return;
  }

  await challenges.create({
    name: "Challenge_" + Math.random().toString().substr(2, 4),
    category: req.body.category,
  });

  res.send({ state: "success", message: "Challenge created!" });
};

exports.removeDockerCompose = async function (req, res) {
  const challenge = await challenges.findById(req.body.id);

  if (challenge) {
    if (challenge.dockerCompose != "") {
      const dockerComposePath = path.join(
        __dirname,
        "../dockers/" + challenge.dockerCompose
      );
      try {
        fs.rmdirSync(dockerComposePath, { recursive: true });
      } catch (err) {
        console.error(err);
      }
      await challenges.findByIdAndUpdate(req.body.id, {
        dockerCompose: "",
        dockerLaunchers: [],
      });
      res.send({ state: "success", message: "Docker compose removed!" });
    } else {
      res.send({
        state: "error",
        message: "Challenge does not have a docker compose",
      });
    }
  } else {
    res.send({ state: "error", message: "Challenge does not exist" });
  }
};

exports.updateChallengeCategory = async function (req, res) {
  const challengeExists = await challenges.findById(req.body.id);

  if (challengeExists) {
    await challenges.findByIdAndUpdate(req.body.id, {
      category: req.body.category,
    });
    res.send({ state: "success", message: "Challenge category changed!" });
  } else {
    res.send({ state: "error", message: "Challenge does not exist" });
  }
};

exports.deleteChallenge = async function (req, res) {
  const challengeExists = await challenges.findById(req.body.id);

  if (challengeExists) {
    await challenges.findByIdAndDelete(req.body.id);

    await users.updateMany(
      {
        solved: { $elemMatch: { "challenge._id": challengeExists._id } },
      },
      {
        $pull: { solved: { _id: challengeExists._id } },
        $inc: { score: -challengeExists.points },
      }
    );

    await teams.updateMany(
      {
        users: {
          $elemMatch: {
            solved: { $elemMatch: { "challenge._id": challengeExists._id } },
          },
        },
      },
      {
        $pull: { "users.$.solved": { _id: ObjectId(challengeExists._id) } },
        $inc: { "users.$.score": -challengeExists.points },
      }
    );

    res.send({ state: "success", message: "Challenge deleted!" });
  } else {
    res.send({ state: "error", message: "Challenge does not exist" });
  }
};

exports.getAssets = async function (req, res) {
  const assetsPath = path.join(__dirname, "../assets/");

  await fs.readdir(assetsPath, function (err, files) {
    //handling error
    if (err) {
      console.log(err);
      res.send([]);
    } else {
      let fileData = [];
      //listing all files using forEach
      files.forEach(function (file) {
        // Do whatever you want to do with the file
        if (file != ".gitignore") {
          fileData.push({
            name: file,
          });
        }
      });
      res.send(fileData);
    }
  });
};

exports.deleteAsset = async function (req, res) {
  const assetsPath = path.join(__dirname, "../assets/");

  await fs.unlink(assetsPath + req.body.asset, async (err) => {
    if (err) {
      res.send({ state: "error", message: err.message });
    } else {
      await challenges.updateMany({ file: req.body.asset }, { file: "" });
      res.send({ state: "success" });
    }
  });
};

exports.uploadAsset = async function (req, res) {
  try {
    if (!req.files) {
      res.send({ state: "error", message: "No file uploaded" });
    } else {
      //Use the name of the input field (i.e. "file") to retrieve the uploaded file
      let file = req.files.file;

      //Use the mv() method to place the file in upload directory (i.e. "assets")
      // file.mv("./assets/" + file.name.split('.')[0] + Math.floor(100000 + Math.random() * 900000) + '.' + file.name.split('.')[1]);
      file.mv("./assets/" + file.name);

      //send response
      res.send({ state: "success", message: "File uploaded!" });
    }
  } catch (err) {
    res.send({ state: "error", message: err.message });
  }
};

exports.saveConfigs = async function (req, res) {
  const newConfigs = req.body.newConfigs;
  let error = false;

  await newConfigs.forEach(async (config) => {
    await ctfConfig.updateOne(
      { name: config.name },
      { value: JSON.parse(config.value) }
    );
  });

  if (!error) {
    res.send({ state: "success" });
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
        allUsers = await users
          .aggregate([
            {
              $match: { username: new RegExp(search, "i") },
            },
            {
              $unwind: {
                path: "$solved",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "challenges",
                let: { chalId: "$solved._id", timestamp: "$solved.timestamp" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$$chalId", "$_id"] },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      solve: {
                        _id: "$_id",
                        challenge: {
                          points: "$points",
                          name: "$name",
                          _id: "$_id",
                        },
                        timestamp: "$$timestamp",
                        points: "$points",
                      },
                    },
                  },
                  {
                    $replaceRoot: { newRoot: "$solve" },
                  },
                ],
                as: "solved",
              },
            },
            {
              $unwind: {
                path: "$solved",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$_id",
                username: { $first: "$username" },
                score: { $sum: "$solved.points" },
                solved: { $push: "$solved" },
                verified: { $first: "$verified" },
                isAdmin: { $first: "$isAdmin" },
                shadowBanned: { $first: "$shadowBanned" },
              },
            },
          ])
          .sort({ score: -1, _id: 1 })
          .skip((page - 1) * 100)
          .limit(100);

        res.send(allUsers);
      } catch (err) {
        res.send({ state: "error", message: err.message });
      }
    }
  }
};

exports.deleteUser = async function (req, res) {
  const user = await users.findById(req.body.user._id);

  if (user) {
    await users.findByIdAndRemove(req.body.user._id);

    if (ObjectId.isValid(user.teamId)) {
      await teams
        .findOneAndUpdate(
          {
            _id: user.teamId,
            users: { $elemMatch: { username: user.username } },
          },
          {
            $pull: {
              users: { username: user.username },
            },
          },
          { returnOriginal: false }
        )
        .then(async function (team) {
          if (team) {
            if (team.users) {
              if (team.users.length <= 0) {
                await teams.findByIdAndRemove(user.teamId);
              }
            }
          }
        });
    }

    res.send({ state: "success" });
  } else {
    res.send({ state: "error", message: "User not found!" });
  }
};

exports.addAdmin = async function (req, res) {
  const user = await users.findById(req.body.user._id);

  if (user) {
    if (!user.isAdmin) {
      await users.findByIdAndUpdate(req.body.user._id, { isAdmin: true });
      res.send({ state: "success" });
    } else {
      res.send({ state: "error", message: "User is already an Admin!" });
    }
  } else {
    res.send({ state: "error", message: "User not found!" });
  }
};

exports.removeAdmin = async function (req, res) {
  const user = await users.findById(req.body.user._id);

  if (user) {
    if (user.isAdmin) {
      await users.findByIdAndUpdate(req.body.user._id, { isAdmin: false });
      res.send({ state: "success" });
    } else {
      res.send({ state: "error", message: "User is not an Admin!" });
    }
  } else {
    res.send({ state: "error", message: "User not found!" });
  }
};

exports.shadowBan = async function (req, res) {
  const user = await users.findById(req.body.user._id);

  if (user) {
    if (!user.shadowBanned) {
      await users.findByIdAndUpdate(req.body.user._id, { shadowBanned: true });

      if (ObjectId.isValid(user.teamId)) {
        await teams.findOneAndUpdate(
          {
            _id: user.teamId,
            users: { $elemMatch: { username: user.username } },
          },
          {
            $set: {
              "users.$.shadowBanned": true,
            },
          }
        );
      }

      res.send({ state: "success" });
    } else {
      res.send({ state: "error", message: "User is already shadowBanned!" });
    }
  } else {
    res.send({ state: "error", message: "User not found!" });
  }
};

exports.unShadowBan = async function (req, res) {
  const user = await users.findById(req.body.user._id);

  if (user) {
    if (user.shadowBanned) {
      await users.findByIdAndUpdate(req.body.user._id, { shadowBanned: false });

      if (ObjectId.isValid(user.teamId)) {
        await teams.findOneAndUpdate(
          {
            _id: user.teamId,
            users: { $elemMatch: { username: user.username } },
          },
          {
            $set: {
              "users.$.shadowBanned": false,
            },
          }
        );
      }

      res.send({ state: "success" });
    } else {
      res.send({ state: "error", message: "User is not shadowBanned!" });
    }
  } else {
    res.send({ state: "error", message: "User not found!" });
  }
};

exports.deleteTeam = async function (req, res) {
  const team = await teams.findById(req.body.team._id);

  if (team) {
    await teams.findByIdAndRemove(req.body.team._id);
    res.send({ state: "success" });
  } else {
    res.send({ state: "error", message: "Team not found!" });
  }
};

exports.saveTheme = async function (req, res) {
  const currentTheme = await theme.findOne({});

  if (currentTheme) {
    await theme.findOneAndUpdate(
      {},
      {
        color_1: req.body.color_1,
        color_2: req.body.color_2,
        bg_img: req.body.bg_img.trim(),
        top1_icon: req.body.top1_icon,
        top2_icon: req.body.top2_icon,
        top3_icon: req.body.top3_icon,
      }
    );
    res.send({ state: "success" });
  } else {
    res.send({ state: "error", message: "No theme found!" });
  }
};

exports.sendGlobalMessage = async function (req, res) {
  const currentNotifications = await ctfConfig.findOne({
    name: "notifications",
  });

  if (currentNotifications) {
    await ctfConfig.findOneAndUpdate(
      { name: "notifications" },
      {
        value: [
          ...currentNotifications.value,
          ...[
            {
              message: "ADMIN : " + req.body.globalMessage,
              type: "admin",
              seenBy: [],
            },
          ],
        ],
      }
    );
    res.send({ state: "success" });
  } else {
    res.send({ state: "error", message: "Notifications table not found!" });
  }
};

exports.getLogs = async function (req, res) {
  let search = req.body.search;
  let page = req.body.page;

  try {
    if (page <= 0) throw Error("Page cannot be less than 1!");
    let logCount = await log.count();
    if ((page - 1) * 100 > logCount) throw Error("No more pages!");
    if (isNaN(page)) page = 1;

    const logs = await log
      .find({
        $or: [
          { authorIp: new RegExp(search, "i") },
          { authorId: new RegExp(search, "i") },
          { authorName: new RegExp(search, "i") },
          { function: new RegExp(search, "i") },
          { result: new RegExp(search, "i") },
        ],
      })
      .skip((page - 1) * 100)
      .limit(100);
    res.send(logs);
  } catch (e) {
    res.send({ state: "error", message: e.message });
  }
};

exports.getDockers = async function (req, res) {
  let search = req.body.search;
  let page = req.body.page;

  try {
    if (page <= 0) throw Error("Page cannot be less than 1!");
    let logCount = await log.count();
    if ((page - 1) * 100 > logCount) throw Error("No more pages!");
    if (isNaN(page)) page = 1;

    let dockers = (
      await axios.post(
        `${process.env.DEPLOYER_API}/api/getAllDockers`,
        {
          page: page,
        },
        {
          headers: {
            "X-API-KEY": process.env.DEPLOYER_SECRET,
          },
        }
      )
    ).data.dockers;

    dockers = await Promise.all(
      dockers.map(async (x) => {
        x.team = await teams.findById(x.ownerId, { name: 1 });
        x.challenge = await challenges.findById(x.challengeId, { name: 1 });
        if (
          new RegExp(search).test(x.team.name) ||
          new RegExp(search).test(x.challenge.name) ||
          new RegExp(search).test(x.randomFlag) ||
          new RegExp(search).test(x.mappedPort)
        )
          return x;
      })
    );

    dockers = dockers.filter((x) => x !== undefined);

    res.send(dockers);
  } catch (e) {
    res.send({ state: "error", message: e.message });
  }
};

exports.restartDocker = async function (req, res) {
  try {
    const dockerToRestart = req.body.docker;

    let resAxios = await axios.post(
      `${process.env.DEPLOYER_API}/api/shutdownDocker`,
      {
        ownerId: dockerToRestart.ownerId,
        challengeId: dockerToRestart.challengeId,
      },
      {
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
        },
      }
    );

    if (resAxios.data.state == "error") throw new Error(resAxios.data.message);

    resAxios = await axios.post(
      `${process.env.DEPLOYER_API}/api/deployDocker`,
      {
        githubUrl: dockerToRestart.githubUrl,
        ownerId: dockerToRestart.ownerId,
        challengeId: dockerToRestart.challengeId,
        randomFlag: dockerToRestart.randomFlag != "false" ? true : false,
      },
      {
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
        },
      }
    );

    if (resAxios.data.state == "error") throw new Error(resAxios.data.message);

    const challenge = await challenges.findById(dockerToRestart.challengeId);
    if (challenge && challenge.randomFlag) {
      if (challenge.randomFlags.find((x) => x.id == dockerToRestart.ownerId)) {
        await challenges.updateOne(
          { id: challenge._id },
          {
            $pull: {
              randomFlags: { id: dockerToRestart.ownerId },
            },
          }
        );
      }

      await challenges.updateOne(
        { id: challenge._id },
        {
          $push: {
            randomFlags: {
              id: dockerToRestart.ownerId,
              flag: resAxios.data.flag,
            },
          },
        }
      );

      //COMBINE PULL & PUSH
    }

    res.send({ state: "success", message: "Restarted Docker!" });
  } catch (error) {
    if (error.response?.data?.message)
      return res.send({ state: "error", message: error.response.data.message });
    res.send({ state: "error", message: error.message });
  }
};

exports.shutdownDocker = async function (req, res) {
  try {
    const dockerToStop = req.body.docker;

    const resAxios = await axios.post(
      `${process.env.DEPLOYER_API}/api/shutdownDocker`,
      {
        ownerId: dockerToStop.ownerId,
        challengeId: dockerToStop.challengeId,
      },
      {
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
        },
      }
    );

    if (resAxios.data.state == "error") throw new Error(resAxios.data.message);

    const challenge = await challenges.findById(dockerToStop.challengeId);
    if (challenge && challenge.randomFlag) {
      await challenges.updateOne(
        { id: challenge._id },
        {
          $pull: {
            randomFlags: { id: dockerToStop.ownerId },
          },
        }
      );
    }

    res.send({ state: "success", message: "Docker shutdown!" });
  } catch (error) {
    if (error.response?.data?.message)
      return res.send({ state: "error", message: error.response.data.message });
    res.send({ state: "error", message: error.message });
  }
};
