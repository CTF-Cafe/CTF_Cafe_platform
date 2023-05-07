const challenges = require("../models/challengeModel");
const users = require("../models/userModel");
const teams = require("../models/teamModel");
const ctfConfig = require("../models/ctfConfigModel.js");
const logController = require("./logController");
const ObjectId = require("mongoose").Types.ObjectId;
const { Webhook } = require("discord-webhook-node");

let hook;
if ("WEBHOOK" in process.env) {
  hook = new Webhook(process.env.WEBHOOK);
  const IMAGE_URL = "https://cdn-icons-png.flaticon.com/512/205/205916.png";
  hook.setUsername("First Blood");
  hook.setAvatar(IMAGE_URL);
}

exports.getChallenges = async function (req, res) {
  let allChallenges = await challenges
    .find({ hidden: false }, { name: 1, category: 1, hints: 1, points: 1, firstBloodPoints: 1, info: 1, level: 1, solveCount: 1, file: 1, codeSnippet: 1, codeLanguage: 1, firstBlood: 1, isInstance: 1, requirement: 1, randomFlag: 1 })
    .sort({ points: 1 });
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
      .findById(req.session.userId)
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

          if (ObjectId.isValid(challenge.requirement)) {
            // CHECK CHALL UNLOCKED
            let teamHasUnlocked = false;
            if (team) {
              // Check if hint bought by team
              if (
                team.users.filter((user) =>
                  user.solved.find((x) =>
                    new ObjectId(x._id).equals(challenge.requirement)
                  )
                ).length > 0
              ) {
                teamHasUnlocked = true;
              }
            }

            if (
              !user.solved.find((x) =>
                new ObjectId(x._id).equals(challenge.requirement)
              ) &&
              teamHasBought == false
            ) {
              continue;
            }
          }

          copy.hints = challenge.hints.map((hint) => {
            hintCopy = { ...hint };
            // Check Team Exists
            if (team) {
              // Check if hint bought by team
              if (
                team.users.filter((user) =>
                  user.hintsBought.find(
                    (x) =>
                      challenge._id.equals(x.challId) &&
                      parseInt(x.hintId) == parseInt(hint.id)
                  )
                ).length > 0
              ) {
                teamHasBought = true;
              }
            }

            // Show hint if bought
            if (
              !user.hintsBought.find(
                (x) =>
                  challenge._id.equals(x.challId) &&
                  parseInt(x.hintId) == parseInt(hint.id)
              ) &&
              hint.cost > 0 &&
              teamHasBought == false
            ) {
              hintCopy.content = "";
            } else {
              hintCopy.cost = 0;
            }

            return hintCopy;
          });

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

let deploying = [];
exports.deployDocker = async function (req, res) {
  try {
    const user = await users.findById(req.session.userId);
    if (!user) throw new Error("User not found");
    if (!ObjectId.isValid(user.teamId)) throw new Error("Not in a team!");

    const team = await teams.findById(user.teamId);
    if (!team) throw new Error("Not in a team!");

    if (deploying.find((x) => new ObjectId(x).equals(user.teamId))) {
      throw new Error("Already deploying a docker");
    }

    deploying.push(user.teamId);

    try {
      const startTime = await ctfConfig.findOne({ name: "startTime" });
      if (parseInt(startTime.value) - Math.floor(new Date().getTime()) >= 0) {
        throw new Error("CTF has not started!");
      }

      const challenge = await challenges.findOne({
        _id: ObjectId(req.body.challengeId),
      });

      if (!challenge || !challenge.isInstance || !challenge.githubUrl) {
        throw new Error("Challenge doesn't have a github url!");
      }

      // Check Team Docker Limit
      const dockerLimit = await ctfConfig.findOne({ name: "dockerLimit" });
      const deployed = await getDockers(user.teamId);
      if (deployed.length >= dockerLimit.value) {
        throw new Error("Docker limit reached!");
      }

      const resFetch = await await (
        await fetch(`${process.env.DEPLOYER_API}/instances`, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.DEPLOYER_SECRET,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            githubUrl: challenge.githubUrl,
            owner: user.teamId,
            challengeId: challenge.id,
            customEnv: {
              FLAG: challenge.flag,
            },
          }),
        })
      ).json();

      if (resFetch.state == "error") {
        throw new Error(resFetch.message);
      }

      if (challenge.randomFlag) {
        if (challenge.randomFlags.find((x) => x.id == user.teamId)) {
          await challenges.updateOne(
            { id: challenge._id },
            {
              $pull: {
                randomFlags: { id: user.teamId },
              },
            }
          );
        }

        await challenges.updateOne(
          { id: challenge._id },
          {
            $push: {
              randomFlags: { id: user.teamId, flag: resFetch.flag },
            },
          }
        );
      }

      const statusFetch = await await (
        await fetch(
          `${process.env.DEPLOYER_API}/instances/owner/${user.teamId}/{challenge.id}`,
          {
            method: "GET",
            headers: {
              "X-API-KEY": process.env.DEPLOYER_SECRET,
              "Content-Type": "application/json",
            },
          }
        )
      ).json();

      deploying = deploying.filter((x) => !new ObjectId(x).equals(user.teamId));

      if (statusFetch.state == "error") throw new Error(statusFetch.message);

      res.send({ state: "success", message: statusFetch });
    } catch (e) {
      deploying = deploying.filter((x) => !new ObjectId(x).equals(user.teamId));
      throw e;
    }
  } catch (error) {
    res.send({ state: "error", message: error.message });
  }
};

exports.deployDocker = async function (req, res) {
  try {
    const user = await users.findById(req.session.userId);
    if (!user) throw new Error("User not found");
    if (!ObjectId.isValid(user.teamId)) throw new Error("Not in a team!");

    const team = await teams.findById(user.teamId);
    if (!team) throw new Error("Not in a team!");

    const startTime = await ctfConfig.findOne({ name: "startTime" });
    if (parseInt(startTime.value) - Math.floor(new Date().getTime()) >= 0)
      throw new Error("CTF has not started!");

    const challenge = await challenges.findOne({
      _id: ObjectId(req.body.challengeId),
    });

    if (!challenge) throw new Error("Challenge does not exist!");
    if (!challenge.isInstance) throw new Error("Challenge is not an instance!");
    if (!challenge.githubUrl)
      throw new Error("Challenge doesn't have a github url!");

    // Check Team Docker Limit
    const dockerLimit = await ctfConfig.findOne({ name: "dockerLimit" });
    const deployed = await getDocker(user.teamId);
    if (deployed.length >= dockerLimit.value)
      throw new Error("Docker limit reached!");

    const resFetch = await await (
      await fetch(`${process.env.DEPLOYER_API}/api/deployDocker`, {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubUrl: challenge.githubUrl,
          ownerId: user.teamId,
          challengeId: challenge.id,
          randomFlag: challenge.randomFlag,
        }),
      })
    ).json();

    if (resFetch.state == "error") throw new Error(resFetch.message);

    if (challenge.randomFlag) {
      if (challenge.randomFlags.find((x) => x.id == user.teamId)) {
        await challenges.updateOne(
          { id: challenge._id },
          {
            $pull: {
              randomFlags: { id: user.teamId },
            },
          }
        );
      }

      await challenges.updateOne(
        { id: challenge._id },
        {
          $push: {
            randomFlags: { id: user.teamId, flag: resFetch.flag },
          },
        }
      );
    }

    delete resFetch.flag;
    res.send({ state: "success", message: resFetch });
  } catch (error) {
    res.send({ state: "error", message: error.message });
  }
};

exports.shutdownDocker = async function (req, res) {
  try {
    const user = await users.findById(req.session.userId);
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

    const resFetch = await (
      await fetch(`${process.env.DEPLOYER_API}/api/shutdownDocker`, {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerId: user.teamId,
          challengeId: challenge.id,
        }),
      })
    ).json();

    if (resFetch.state == "error") throw new Error(resFetch.message);

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

    res.send({ state: "success", message: resFetch });
  } catch (error) {
    if (error.response?.data?.message)
      return res.send({ state: "error", message: error.response.data.message });
    res.send({ state: "error", message: error.message });
  }
};

async function getDocker(teamId) {
  try {
    const deployed = await (
      await fetch(`${process.env.DEPLOYER_API}/api/getDockers`, {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.DEPLOYER_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerId: teamId,
        }),
      })
    ).json();

    return deployed.dockers.map((c) => {
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
    if (currentlySubmittingUsers.includes(req.session.userId))
      throw new Error("Submiting to fast!");

    currentlySubmittingUsers.push(req.session.userId);

    const endTime = await ctfConfig.findOne({ name: "endTime" });
    const startTime = await ctfConfig.findOne({ name: "startTime" });

    if (parseInt(endTime.value) - Math.floor(new Date().getTime()) <= 0)
      throw new Error("CTF is Over!");
    else if (parseInt(startTime.value) - Math.floor(new Date().getTime()) >= 0)
      throw new Error("CTF has not started!");

    const userId = req.session.userId;
    const flag = req.body.flag.trim();
    const user = await users.findOne({ _id: userId, verified: true });

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
      // challenge.flag =
      //   challenge.flag[0] != "^" ? "^" + challenge.flag : challenge.flag;
      // challenge.flag =
      //   challenge.flag[-1] != "$" ? challenge.flag + "$" : challenge.flag;

      // check flag
      // if (!new RegExp(challenge.flag).test(flag)) {
      //   logController.createLog(req, user, {
      //     state: "error",
      //     message: "Wrong Flag :( " + flag,
      //   });
      //   throw new Error("Wrong Flag :(");
      // }

      if (!(challenge.flag === flag)) {
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
      { _id: userId, verified: true },
      { $push: { solved: { _id: challenge._id, timestamp: timestamp } } }
    );

    const updatedUser = await users.findOne({
      _id: userId,
      verified: true,
    });

    await teams.updateOne(
      {
        _id: team._id,
        users: { $elemMatch: { _id: updatedUser._id } },
      },
      {
        $set: {
          "users.$.solved": updatedUser.solved,
        },
      }
    );

    if (
      challenge.firstBlood == "none" ||
      user._id.equals(challenge.firstBlood)
    ) {
      await challenges.updateOne(
        { _id: req.body.challengeId },
        { $inc: { solveCount: 1 }, firstBlood: updatedUser._id }
      );

      if ("WEBHOOK" in process.env) {
        // DISCORD WEBHOOK FIRST BLOOD
        hook.send(
          `:drop_of_blood: ${user.username}@${team.name} has firstBlood ${challenge.name}`
        );
      }

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
                  message: `${updatedUser.username}@${team.name} has first blood ${challenge.name}!`,
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
      (item) => item !== req.session.userId
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

    const user = await users.findOne({
      _id: req.session.userId,
      verified: true,
    });

    // Check if user exists
    if (!user) throw new Error("Not logged in!");

    // Check challengeId is valid
    if (!ObjectId.isValid(req.body.challengeId))
      throw new Error("Invalid challengeId!");

    let challenge = await challenges.findOne({
      _id: ObjectId(req.body.challengeId),
    });

    // Check challenge has hint to be bought
    const hint = challenge.hints.find((x) => x.id == req.body.hintId);
    if (hint.cost <= 0) throw new Error("Challenge hint is free!");

    // Check user already bought hint
    if (
      user.hintsBought.find(
        (x) =>
          challenge._id.equals(x.challId) &&
          parseInt(x.hintId) == parseInt(hint.id)
      )
    )
      throw new Error("Challenge hint already bought!");

    // Check teamId is valid
    if (!ObjectId.isValid(user.teamId)) throw new Error("Not in a team!");

    const team = await teams.findById(user.teamId);

    // Check Team Exists
    if (!team) throw new Error("Not in a team!");

    teamId = user.teamId;

    // Check Team bought Hint
    if (
      team.users.filter((user) =>
        user.hintsBought.find(
          (x) =>
            challenge._id.equals(x.challId) &&
            parseInt(x.hintId) == parseInt(hint.id)
        )
      ).length > 0
    )
      throw new Error("Hint already bought!");

    for (let i = 0; i < user.solved.length; i++) {
      let challenge = await challenges.findById(user.solved[i]._id);
      if (challenge) {
        user.solved[i].challenge = challenge;
        user.score += challenge.points;
      }
    }

    // Check User has enough points
    if (user.score < hint.cost) throw new Error("Not enough points!");

    let timestamp = new Date().getTime();
    await users.updateOne(
      { _id: req.session.userId, verified: true },
      {
        $push: {
          hintsBought: {
            challId: challenge._id,
            hintId: hint.id,
            cost: hint.cost,
            timestamp: timestamp,
          },
        },
      }
    );

    const updatedUser = await users.findOne({
      _id: req.session.userId,
      verified: true,
    });

    await teams.updateOne(
      {
        _id: team._id,
        users: { $elemMatch: { _id: updatedUser._id } },
      },
      {
        $set: {
          "users.$.hintsBought": updatedUser.hintsBought,
        },
      }
    );

    logController.createLog(req, updatedUser, {
      state: "success",
      hint: hint,
    });

    res.send({ state: "success", hint: hint });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};
