const teams = require("../models/teamModel");
const users = require("../models/userModel");
const { v4 } = require("uuid");
const ObjectId = require("mongoose").Types.ObjectId;
const dbController = require("./dbController");
const ctfConfig = require("../models/ctfConfigModel");
const { isValidObjectId } = require("mongoose");

exports.register = async function (req, res) {
  const teamName = req.body.teamName.trim();

  if (teamName.length > 32) {
    res.send({ state: "error", message: "Team name is to long!" });
  } else {
    const teamNameExists = await teams.findOne({ name: teamName });

    if (!teamNameExists) {
      const userToCheck = await users.findOne({
        _id: req.session.userId,
        verified: true,
      });

      let userTeamExists;
      if (ObjectId.isValid(userToCheck.teamId)) {
        userTeamExists = await teams.findById(userToCheck.teamId);
      }

      if (!userTeamExists) {
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
                  user: user,
                  team: team,
                });
              });
          })
          .catch(function (err) {
            console.log(err.message);
            res.send({ state: "error", message: "Team creation failed!" });
          });
      } else {
        res.send({ state: "error", message: "Already in a team!" });
      }
    } else {
      res.send({ state: "error", message: "Team name Exists!" });
    }
  }
};

exports.getCode = async function (req, res) {
  const teamName = req.body.teamName;

  const teamNameExists = await teams.findOne({ name: teamName });

  if (teamNameExists) {
    const userHasTeam = await users.findOne({
      _id: req.session.userId,
      verified: true,
    });
    if (userHasTeam.teamId == teamNameExists.id) {
      res.send({ state: "success", code: teamNameExists.inviteCode });
    }
  } else {
    res.send({ state: "error", message: "Team dosnt exist!" });
  }
};

exports.joinTeam = async function (req, res) {
  const teamCode = req.body.teamCode;

  const teamCodeExists = await teams.findOne({ inviteCode: teamCode });

  if (teamCodeExists) {
    const userToCheck = await users.findOne({
      _id: req.session.userId,
      verified: true,
    });

    let userTeamExists;
    if (ObjectId.isValid(userToCheck.teamId)) {
      userTeamExists = await teams.findById(userToCheck.teamId);
    }

    if (!userTeamExists) {
      if (teamCodeExists.users.length < 4) {
        if (teamCodeExists.category === userToCheck.category) {
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
                    user: user,
                    team: team,
                  });
                });
            })
            .catch((error) => {
              res.send({ state: "error", message: error.messsage });
            });
        }
      } else {
        res.send({ state: "error", message: "Team is full!" });
      }
    } else {
      res.send({ state: "error", message: "You already have a team!" });
    }
  } else {
    res.send({ state: "error", message: "Team code is invalid!" });
  }
};

exports.getTeams = async function (req, res) {
  let page = req.body.page;
  let search = req.body.search;
  let userCategory = req.body.category;

  if (page <= 0) {
    res.send({ state: "error", message: "Page cannot be less than 1!" });
  } else {
    const userToCheck = await users.findById(req.session.userId);
    if (!userToCheck || !userToCheck.isAdmin) {
      // DONT SEND TEAMS IF SCOREBOARD HIDDEN AND NOT ADMIN
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

    let teamCount = await teams.count();
    if ((page - 1) * 100 > teamCount) {
      res.send({ state: "error", message: "No more pages!" });
    } else {
      if (isNaN(page)) {
        page = 1;
      }

      let allTeams = [];
      try {
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
          .sort({ totalScore: -1, maxTimestamp: -1, _id: 1 })
          .skip((page - 1) * 100)
          .limit(100);

        res.send(allTeams);
      } catch (err) {
        res.send({ state: "error", message: err.message });
      }
    }
  }
};

exports.getUserTeam = async function (req, res) {
  try {
    if (!req.body.teamId || !ObjectId.isValid(req.body.teamId)) {
      res.send({ state: "error", message: "teamId is a required parameter!" });
      return;
    }

    const team = await dbController.resolveTeamsFull({
      _id: new ObjectId(req.body.teamId),
    });

    if (team[0]) {
      if (!team[0].users.find((x) => x._id.equals(req.session.userId))) {
        res.send({ state: "error", message: "You are not in this team!" });
        return;
      }

      res.send(team[0]);
      return;
    } else {
      res.send({ state: "error", message: "You are not in any team!" });
      return;
    }
  } catch (err) {
    console.log(err);
    res.send({ state: "error" });
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
              user: user,
              team: team,
            });
          });
      });
  } else {
    res.send({ state: "error", message: "You are not in a team!" });
  }
};

exports.getTeam = async function (req, res) {
  let team = await dbController.resolveTeamsFull({
    name: decodeURIComponent(req.body.teamName.trim()),
  });

  if (team[0]) {
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
  } else {
    res.send({ state: "error", message: "Team not found" });
  }
};

exports.saveTeamCountry = async function (req, res) {
  const userToCheck = await users.findById(req.session.userId);

  let userTeamExists;
  if (ObjectId.isValid(userToCheck.teamId)) {
    userTeamExists = await teams.findById(userToCheck.teamId);
  }

  const country = req.body.country;

  if(!/^\p{Emoji}$/u.test(country)) {
    res.send({ state: "error", message: "Country is not an emoji!" });
    return;
  }

  if (userTeamExists) {
    if (userTeamExists.teamCaptain === req.session.userId) {
      await teams.findOneAndUpdate(
        { _id: userTeamExists.id },
        { $set: { country: country } }
      );

      res.send({
        state: "success",
        message: "Team Country Changed!",
      });

    } else {
      res.send({ state: "error", message: "You are not a teamCaptain!" });
    }
  } else {
    res.send({ state: "error", message: "User is not in a team!" });
  }
};

exports.kickUser = async function (req, res) {
  const userToCheck = await users.findOne({
    username: req.body.userToKick,
    verified: true,
  });

  let userTeamExists;
  if (ObjectId.isValid(userToCheck.teamId)) {
    userTeamExists = await teams.findById(userToCheck.teamId);
  }

  if (userTeamExists) {
    if (userTeamExists.teamCaptain === req.session.userId) {
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
                user: user,
                team: team,
              });
            });
        });
    } else {
      res.send({ state: "error", message: "You are not a teamCaptain!" });
    }
  } else {
    res.send({ state: "error", message: "User is not in a team!" });
  }
};
