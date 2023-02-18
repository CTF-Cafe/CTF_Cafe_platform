const challenges = require("../models/challengeModel");
const users = require("../models/userModel");
const teams = require("../models/teamModel");
const ctfConfig = require("../models/ctfConfigModel.js");
const logController = require("./logController");
const ObjectId = require("mongoose").Types.ObjectId;
const axios = require("axios");

exports.getChallenges = async function (req, res) {
  let allChallenges = await challenges.find({}).sort({ points: 1 });
  const startTime = await ctfConfig.findOne({ name: "startTime" });
  const endTime = await ctfConfig.findOne({ name: "endTime" });
  let categories = [];

  if (parseInt(startTime.value) - Math.floor(new Date().getTime()) >= 0) {
    res.send({
      state: "error",
      message: "CTF has not started!",
      startTime: startTime.value,
    });
  } else {
    users
      .findOne({ username: req.session.username })
      .then(async (user) => {
        const deployed = await getDocker(user.teamId);
        let returnedChallenges = [];

        for (let i = 0; i < allChallenges.length; i++) {
          const challenge = allChallenges[i];
          let copy = { ...challenge._doc, id: challenge.id };

          let team = false;
          let teamHasBought = false;

          // Check teamId is valid
          if (ObjectId.isValid(user.teamId)) {
            team = await teams.findById(user.teamId);
          }

          // Check Team Exists
          if (team) {
            // Check if hint bought by team
            if (
              team.users.filter((user) => {
                return (
                  user.hintsBought.filter((obj) => {
                    return obj.challId.equals(challenge._id);
                  }).length > 0
                );
              }).length > 0
            ) {
              teamHasBought = true;
            }
          }

          // Show hint if bought
          if (
            !user.hintsBought.find((x) => x.challId.equals(challenge._id)) &&
            challenge.hintCost > 0 &&
            teamHasBought == false
          ) {
            copy.hint = "";
          } else {
            copy.hintCost = 0;
          }

          let challengeDeployed = deployed.find(
            (d) => d.challengeId == copy.id
          );
          if (challengeDeployed) {
            if (!challengeDeployed.progress) {
              copy.url = challengeDeployed.url;
              copy.progress = "finished";
            } else {
              copy.progress = challengeDeployed.progress;
            }
          }

          delete copy.flag;
          delete copy.githubUrl;
          if (categories.indexOf(copy.category) == -1)
            categories.push(copy.category);

          returnedChallenges.push(copy);
        }

        res.send({
          categories: categories,
          challenges: returnedChallenges,
          endTime: endTime.value,
        });
      })
      .catch((err) => {
        console.log(err);
        res.send({ state: "error", message: err });
      });
  }
};

exports.deployDocker = async function (req, res) {
  try {
    const user = await users.findOne({ username: req.session.username });
    if (!user) throw new Error("User not found");
    if (!ObjectId.isValid(user.teamId)) throw new Error("Not in a team!");

    const team = await teams.findById(user.teamId);
    if (!team) throw new Error("Not in a team!");

    const challenge = await challenges.findOne({
      _id: ObjectId(req.body.challengeId),
    });

    if (!challenge) throw new Error("Challenge does not exist!");
    if (!challenge.isInstance) throw new Error("Challenge is not an instance!");
    if (!challenge.githubUrl)
      throw new Error("Challenge doesn't have a github url!");

    const resAxios = await axios.post(
      `${process.env.DEPLOYER_API}/api/deployDocker`,
      {
        githubUrl: challenge.githubUrl,
        ownerId: user.teamId,
        challengeId: challenge.id,
        randomFlag: challenge.randomFlag,
      },
      {
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
        },
      }
    );

    if (resAxios.data.state == "error") throw new Error(resAxios.data.message);

    if (challenge.randomFlag) {
      await challenges.updateOne(
        { id: challenge._id },
        {
          $push: {
            randomFlags: { id: user.teamId, flag: resAxios.data.flag },
          },
        }
      );
    }

    res.send({ state: "success", message: resAxios.data });
  } catch (error) {
    if (error.response?.data?.message)
      return res.send({ state: "error", message: error.response.data.message });
    res.send({ state: "error", message: error.message });
  }
};

exports.shutdownDocker = async function (req, res) {
  try {
    const user = await users.findOne({ username: req.session.username });
    if (!user) throw new Error("User not found");
    if (!ObjectId.isValid(user.teamId)) throw new Error("Not in a team!");

    const team = await teams.findById(user.teamId);
    if (!team) throw new Error("Not in a team!");

    const challenge = await challenges.findOne({
      _id: ObjectId(req.body.challengeId),
    });

    if (!challenge) throw new Error("Challenge does not exist!");
    if (!challenge.isInstance) throw new Error("Challenge is not an instance!");
    if (!challenge.githubUrl)
      throw new Error("Challenge doesn't have a github url!");

    const resAxios = await axios.post(
      `${process.env.DEPLOYER_API}/api/shutdownDocker`,
      {
        ownerId: user.teamId,
        challengeId: challenge.id,
      },
      {
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
        },
      }
    );

    if (resAxios.data.state == "error") throw new Error(resAxios.data.message);

    if (challenge.randomFlag) {
      await challenges.updateOne(
        { id: challenge._id },
        {
          $pull: {
            randomFlags: { id: user.teamId },
          },
        }
      );
    }

    res.send({ state: "success", message: resAxios.data });
  } catch (error) {
    if (error.response?.data?.message)
      return res.send({ state: "error", message: error.response.data.message });
    res.send({ state: "error", message: error.message });
  }
};

async function getDocker(teamId) {
  try {
    const deployed = await axios.post(
      `${process.env.DEPLOYER_API}/api/getDockers`,
      {
        ownerId: teamId,
      },
      {
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
        },
      }
    );

    return deployed.data.dockers.map((c) => {
      delete c.githubUrl;
      return c;
    });
  } catch (error) {
    return [];
  }
}

let currentlySubmittingUsers = [];
let currentlySubmittingTeams = [];

exports.submitFlag = async function (req, res) {
  let teamId = undefined;
  try {
    // Check if flag is provided
    if (!req.body.flag) throw new Error("No flag provided!");

    // Check if user is currently submitting flag
    if (currentlySubmittingUsers.includes(req.session.username))
      throw new Error("Submiting to fast!");

    currentlySubmittingUsers.push(req.session.username);

    const endTime = await ctfConfig.findOne({ name: "endTime" });
    const startTime = await ctfConfig.findOne({ name: "startTime" });

    if (parseInt(endTime.value) - Math.floor(new Date().getTime()) <= 0)
      throw new Error("CTF is Over!");
    else if (parseInt(startTime.value) - Math.floor(new Date().getTime()) >= 0)
      throw new Error("CTF has not started!");

    const username = req.session.username;
    const flag = req.body.flag.trim();
    const user = await users.findOne({ username: username, verified: true });

    // Check if user exists
    if (!user) throw new Error("Not logged in!");

    // Check challengeId is valid
    if (!ObjectId.isValid(req.body.challengeId))
      throw new Error("Invalid challengeId!");

    let challenge = await challenges.findOne({
      _id: ObjectId(req.body.challengeId),
    });

    // Check random flag
    if (challenge.randomFlag) {
      if (
        challenge.randomFlags.find((obj) => obj.id == user.teamId).flag != flag
      ) {
        logController.createLog(req, user, {
          state: "error",
          message: "Wrong Flag :( " + flag,
        });
        throw new Error("Wrong Flag :(");
      }
    } else {
      
      // Make sure Regex tests the whole string
      challenge.flag = (challenge.flag[0] != "^" ? "^" + challenge.flag : challenge.flag)
      challenge.flag = (challenge.flag[-1] != "$" ? challenge.flag + "$" : challenge.flag)

      // check flag
      if (!new RegExp(challenge.flag).test(flag)) {
        logController.createLog(req, user, {
          state: "error",
          message: "Wrong Flag :( " + flag,
        });
        throw new Error("Wrong Flag :(");
      }
    }

    challenge.flag = "Nice try XD";

    // Check if challenge is already solved
    if (
      user.solved.filter((obj) => {
        return obj._id.equals(challenge._id);
      }).length > 0
    )
      throw new Error("Already Solved!");

    // Check teamId is valid
    if (!ObjectId.isValid(user.teamId)) throw new Error("Not in a team!");

    const team = await teams.findById(user.teamId);

    // Check Team Exists
    if (!team) throw new Error("Not in a team!");

    // Check if team is currently submitting
    if (currentlySubmittingTeams.includes(user.teamId)) {
      logController.createLog(req, user, {
        state: "error",
        message: "Submiting too fast!",
      });
      throw new Error("Submiting too fast!");
    }

    currentlySubmittingTeams.push(user.teamId);
    teamId = user.teamId;

    if (
      team.users.filter((user) => {
        return (
          user.solved.filter((obj) => {
            return obj._id.equals(challenge._id);
          }).length > 0
        );
      }).length > 0
    ) {
      throw new Error("Already Solved!");
    }

    let timestamp = new Date().getTime();

    if (challenge.firstBlood == "none") challenge.firstBlood = user._id;

    const dynamicScoring = await ctfConfig.findOne({ name: "dynamicScoring" });

    if (dynamicScoring.value.toString() == "true") {
      const decay = (await teams.countDocuments()) * 0.18;
      let dynamicPoints = Math.ceil(
        ((challenge.minimumPoints - challenge.initialPoints) /
          (decay ** 2 + 1)) *
          (challenge.solveCount + 1) ** 2 +
          challenge.initialPoints
      );
      if (dynamicPoints < challenge.minimumPoints) {
        dynamicPoints = challenge.minimumPoints;
      }

      await challenges.updateOne(
        { _id: ObjectId(req.body.challengeId) },
        { $set: { points: dynamicPoints } }
      );
      challenge = await challenges.findOne({
        _id: ObjectId(req.body.challengeId),
      });
    }

    await users.updateOne(
      { username: username, verified: true },
      { $push: { solved: { _id: challenge._id, timestamp: timestamp } } }
    );

    const updatedUser = await users.findOne({
      username: username,
      verified: true,
    });

    await teams.updateOne(
      {
        _id: team._id,
        users: { $elemMatch: { username: updatedUser.username } },
      },
      {
        $set: {
          "users.$.solved": updatedUser.solved,
        },
      }
    );

    if (challenge.firstBlood == "none" || challenge.firstBlood == user._id) {
      await challenges.updateOne(
        { _id: req.body.challengeId },
        { $inc: { solveCount: 1 }, firstBlood: updatedUser._id }
      );

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
                  message: `${updatedUser.username} has first blood ${challenge.name}!`,
                  type: "first_blood",
                  seenBy: [],
                },
              ],
            ],
          }
        );
      }
    } else {
      await challenges.updateOne(
        { _id: req.body.challengeId },
        { $inc: { solveCount: 1 } }
      );
    }

    logController.createLog(req, updatedUser, {
      state: "success",
    });

    updatedUser.password = undefined;
    res.send({ state: "success", user: updatedUser });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  } finally {
    currentlySubmittingUsers = currentlySubmittingUsers.filter(
      (item) => item !== req.session.username
    );

    if (teamId) {
      currentlySubmittingTeams = currentlySubmittingTeams.filter(
        (item) => item !== teamId
      );
    }
  }
};

exports.buyHint = async function (req, res) {
  try {
    const endTime = await ctfConfig.findOne({ name: "endTime" });
    const startTime = await ctfConfig.findOne({ name: "startTime" });

    if (parseInt(endTime.value) - Math.floor(new Date().getTime()) <= 0)
      throw new Error("CTF is Over!");
    else if (parseInt(startTime.value) - Math.floor(new Date().getTime()) >= 0)
      throw new Error("CTF has not started!");

    const username = req.session.username;
    const user = await users.findOne({ username: username, verified: true });

    // Check if user exists
    if (!user) throw new Error("Not logged in!");

    // Check challengeId is valid
    if (!ObjectId.isValid(req.body.challengeId))
      throw new Error("Invalid challengeId!");

    let challenge = await challenges.findOne({
      _id: ObjectId(req.body.challengeId),
    });

    // Check challenge has hint to be bought
    if (challenge.hintCost <= 0) throw new Error("Challenge hint is free!");

    // Check user already bought hint
    if (user.hintsBought.includes(challenge._id))
      throw new Error("Challenge hint already bought!");

    // Check teamId is valid
    if (!ObjectId.isValid(user.teamId)) throw new Error("Not in a team!");

    const team = await teams.findById(user.teamId);

    // Check Team Exists
    if (!team) throw new Error("Not in a team!");

    teamId = user.teamId;

    if (
      team.users.filter((user) => {
        return (
          user.hintsBought.filter((obj) => {
            return obj.challId.equals(challenge._id);
          }).length > 0
        );
      }).length > 0
    ) {
      throw new Error("Hint already bought!");
    }

    for (let i = 0; i < user.solved.length; i++) {
      let challenge = await challenges.findById(user.solved[i]._id);
      if (challenge) {
        user.solved[i].challenge = challenge;
        user.score += challenge.points;
      }
    }

    // Check User has enough points
    if (user.score < challenge.hintCost) throw new Error("Not enough points!");

    let timestamp = new Date().getTime();
    await users.updateOne(
      { username: username, verified: true },
      {
        $push: {
          hintsBought: {
            challId: challenge._id,
            cost: challenge.hintCost,
            timestamp: timestamp,
          },
        },
      }
    );

    const updatedUser = await users.findOne({
      username: username,
      verified: true,
    });

    await teams.updateOne(
      {
        _id: team._id,
        users: { $elemMatch: { username: updatedUser.username } },
      },
      {
        $set: {
          "users.$.hintsBought": updatedUser.hintsBought,
        },
      }
    );

    logController.createLog(req, updatedUser, {
      state: "success",
      hint: challenge.hint,
    });

    res.send({ state: "success", hint: challenge.hint });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};
