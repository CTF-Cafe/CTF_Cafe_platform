const { validationResult, matchedData } = require("express-validator");
const teams = require("../models/teamModel");
const users = require("../models/userModel");
const { v4 } = require("uuid");
const ObjectId = require("mongoose").Types.ObjectId;
const dbController = require("./dbController");
const ctfConfig = require("../models/ctfConfigModel");

exports.registerTeam = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const teamName = data.teamName;

    const teamNameExists = await teams.findOne({ name: teamName });

    if (teamNameExists) {
      throw new Error("Team name exists!");
    }

    const userToCheck = await users.findOne({
      _id: req.session.userId,
      verified: true,
    });

    let userTeamExists;
    if (ObjectId.isValid(userToCheck.teamId)) {
      userTeamExists = await teams.findById(userToCheck.teamId);
    }

    if (userTeamExists) {
      throw new Error("Already in a team!");
    }

    await teams
      .create({
        name: teamName,
        inviteCode: v4(),
        teamCaptain: userToCheck._id,
        category: userToCheck.category,
        users: [
          {
            _id: userToCheck._id,
            username: userToCheck.username,
            score: userToCheck.score,
            solved: userToCheck.solved,
            hintsBought: userToCheck.hintsBought,
            shadowBanned: userToCheck.shadowBanned,
            adminPoints: userToCheck.adminPoints,
          },
        ],
      })
      .then(async function (team) {
        await users
          .findOneAndUpdate(
            { _id: req.session.userId, verified: true },
            { teamId: team.id },
            { returnOriginal: false }
          )
          .then(async function (user) {
            res.send({
              state: "success",
              message: "Registered team!",
            });
          });
      })
      .catch(function (err) {
        console.log(err);
        throw new Error("Team creation failed!");
      });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.getCode = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const teamName = data.teamName;

    const teamNameExists = await teams.findOne({ name: teamName });

    if (!teamNameExists) {
      throw new Error("Team does not exist!");
    }

    const userHasTeam = await users.findOne({
      _id: req.session.userId,
      verified: true,
    });

    if (userHasTeam.teamId == teamNameExists.id) {
      res.send({ state: "success", code: teamNameExists.inviteCode });
    } else {
      throw new Error("You are not in this team!");
    }
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.joinTeam = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const teamCode = data.teamCode;

    // Check the code is valid
    const teamCodeExists = await teams.findOne({ inviteCode: teamCode });

    if (!teamCodeExists) {
      throw new Error("Team code is invalid!");
    }

    const userToCheck = await users.findOne({
      _id: req.session.userId,
      verified: true,
    });

    // Check if user in team
    let userTeamExists;
    if (ObjectId.isValid(userToCheck.teamId)) {
      userTeamExists = await teams.findById(userToCheck.teamId);
    }

    if (userTeamExists) {
      throw new Error("Already in a team!");
    }

    // Check team is not full
    if (teamCodeExists.users.length >= 4) {
      throw new Error("Team is full!");
    }

    // Check Team Category matches user
    if (teamCodeExists.category !== userToCheck.category) {
      throw new Error("Team and User are not in the same category!");
    }

    // Check solve conflicts
    conflict = false;
    teamCodeExists.users.map((teamUser) => {
      teamUser.solved.map((x) => {
        if (userToCheck.solved.find((y) => new ObjectId(y._id).equals(x._id))) {
          conflict = true;
        }
      });
    });

    if (conflict) {
      throw new Error("Team and User have solve conflicts!");
    }

    // TODO : USE TRANSACTIONS
    await teams
      .findOneAndUpdate(
        { inviteCode: teamCode },
        {
          $push: {
            users: {
              _id: userToCheck._id,
              username: userToCheck.username,
              score: userToCheck.score,
              solved: userToCheck.solved,
              hintsBought: userToCheck.hintsBought,
              shadowBanned: userToCheck.shadowBanned,
              adminPoints: userToCheck.adminPoints,
            },
          },
        },
        { returnOriginal: false }
      )
      .then(async function (team) {
        await users
          .findOneAndUpdate(
            { _id: req.session.userId, verified: true },
            { teamId: team.id },
            { returnOriginal: false }
          )
          .then(async function (user) {
            res.send({
              state: "success",
              message: "Joined team!",
            });
          });
      })
      .catch((error) => {
        console.log(error);
        throw new Error("Joining team failed!");
      });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.getTeams = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    let page = data.page;
    let search = data.search;
    let userCategory = req.body.category;

    const userToCheck = await users.findById(req.session.userId);
    if (!userToCheck || !userToCheck.isAdmin) {
      // DONT SEND TEAMS IF SCOREBOARD HIDDEN AND NOT ADMIN
      const scoreboardHidden = await ctfConfig.findOne({
        name: "scoreboardHidden",
      });
      if (scoreboardHidden.value) {
        throw new Error("Scoreboard is Hidden!");
      }
    }

    const userCategories = (await ctfConfig.findOne({ name: "userCategories" }))
      .value;

    if (userCategory && !userCategories.find((x) => x === userCategory))
      throw new Error("User Category does not exist!");

    let teamCount = await teams.count();
    if ((page - 1) * 100 > teamCount) {
      throw new Error("No more pages!");
    }

    let allTeams = [];
    allTeams = await dbController
      .resolveTeamsMin({
        category: userCategory ? userCategory : { $exists: true },
        name: new RegExp(search, "i"),
        $or: [
          {
            users: {
              $elemMatch: { _id: req.session.userId },
            },
          },
          {
            users: {
              $not: {
                $elemMatch: { shadowBanned: true },
              },
            },
          },
        ],
      })
      .sort({ totalScore: -1, maxTimestamp: 1, _id: 1 })
      .skip((page - 1) * 100)
      .limit(100);

    res.send(allTeams);
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.getUserTeam = async function (req, res) {
  try {
    const user = await users.findById(req.session.userId);

    if (user.teamId == "none") {
      throw new Error("You are not in any team!");
    }

    const team = await dbController.resolveTeamsFull({
      _id: new ObjectId(user.teamId),
    });

    if (!team[0]) {
      throw new Error("You are not in any team!");
    }

    if (!team[0].users.find((x) => x._id.equals(req.session.userId))) {
      throw new Error("You are not in this team!");
    }

    res.send(team[0]);
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.leaveTeam = async function (req, res) {
  const userToCheck = await users.findOne({
    _id: req.session.userId,
    verified: true,
  });

  let userTeamExists;
  if (ObjectId.isValid(userToCheck.teamId)) {
    userTeamExists = await teams.findById(userToCheck.teamId);
  }

  if (userTeamExists) {
    let newTeamUsers = userTeamExists.users.filter(
      (user) => !user._id.equals(userToCheck._id)
    );
    await teams
      .findOneAndUpdate(
        { _id: userTeamExists.id },
        { $set: { users: newTeamUsers } },
        { returnOriginal: false }
      )
      .then(async function (team) {
        await users
          .findOneAndUpdate(
            { _id: req.session.userId, verified: true },
            { teamId: "none" },
            { returnOriginal: false }
          )
          .then(async function (user) {
            if (team.users) {
              if (team.users.length <= 0) {
                await teams.findByIdAndRemove(team.id);
              }
            }

            res.send({
              state: "success",
              message: "Left team!",
            });
          });
      });
  } else {
    res.send({ state: "error", message: "You are not in a team!" });
  }
};

exports.getTeam = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const teamName = data.teamName;

    let team = await dbController.resolveTeamsFull({
      name: teamName,
    });

    if (!team[0]) {
      throw new Error("Team not found");
    }

    if (!team[0].users.find((x) => x._id.equals(req.session.userId))) {
      const userToCheck = await users.findById(req.session.userId);
      if (!userToCheck || !userToCheck.isAdmin) {
        // DONT SEND TEAM IF SCOREBOARD HIDDEN AND USER NOT IN TEAM OR ADMIN
        const scoreboardHidden = await ctfConfig.findOne({
          name: "scoreboardHidden",
        });
        if (scoreboardHidden.value) {
          res.send({ state: "error", message: "Scoreboard is Hidden!" });
          return;
        }
      }
    }

    res.send(team[0]);
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

// TODO : DONT HANDLE SENDING TEAM & USER BACK
exports.kickUser = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const userToCheck = await users.findOne({
      username: data.userToKick,
      verified: true,
    });

    let userTeamExists;
    if (ObjectId.isValid(userToCheck.teamId)) {
      userTeamExists = await teams.findById(userToCheck.teamId);
    }

    if (!userTeamExists) {
      throw new Error("User is not in a team!");
    }

    if (userTeamExists.teamCaptain !== req.session.userId) {
      throw new Error("You are not the teamCaptain!");
    }

    let newTeamUsers = userTeamExists.users.filter(
      (user) => user.username != req.body.userToKick
    );
    await teams
      .findOneAndUpdate(
        { _id: userTeamExists.id },
        { $set: { users: newTeamUsers } },
        { returnOriginal: false }
      )
      .then(async function (team) {
        await users
          .findOneAndUpdate(
            { username: req.body.userToKick, verified: true },
            { teamId: "none" },
            { returnOriginal: false }
          )
          .then(async function (user) {
            if (team.users) {
              if (team.users.length <= 0) {
                await teams.findByIdAndRemove(team.id);
              }
            }

            res.send({
              state: "success",
              message: "User kicked!",
            });
          });
      });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};

exports.saveTeamCountry = async function (req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new Error(`${result.errors[0].path}: ${result.errors[0].msg}`);
    }

    const data = matchedData(req);

    const country = data.country;

    const userToCheck = await users.findById(req.session.userId);

    let userTeamExists;
    if (ObjectId.isValid(userToCheck.teamId)) {
      userTeamExists = await teams.findById(userToCheck.teamId);
    }

    if (!userTeamExists) {
      throw new Error("User is not in a team!");
    }
    if (userTeamExists.teamCaptain !== req.session.userId) {
      throw new Error("You are not a teamCaptain!");
    }

    await teams.findOneAndUpdate(
      { _id: userTeamExists.id },
      { $set: { country: country } }
    );

    res.send({
      state: "success",
      message: "Team Country Changed!",
    });
  } catch (err) {
    if (err) {
      res.send({ state: "error", message: err.message });
    }
  }
};
