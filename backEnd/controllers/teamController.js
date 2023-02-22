const teams = require("../models/teamModel");
const users = require("../models/userModel");
const { v4 } = require("uuid");
const ctfConfig = require("../models/ctfConfigModel.js");
const ObjectId = require("mongoose").Types.ObjectId;

exports.register = async function (req, res) {
  const teamName = req.body.teamName.trim();

  if (teamName.length > 32) {
    res.send({ state: "error", message: "Team name is to long!" });
  } else {
    const teamNameExists = await teams.findOne({ name: teamName });

    if (!teamNameExists) {
      const userToCheck = await users.findOne({
        username: req.session.username,
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
            teamCaptain: userToCheck.username,
            users: [
              {
                _id: userToCheck._id,
                username: userToCheck.username,
                score: userToCheck.score,
                solved: userToCheck.solved,
                hintsBought: userToCheck.hintsBought,
                shadowBanned: userToCheck.shadowBanned,
              },
            ],
          })
          .then(async function (team) {
            await users
              .findOneAndUpdate(
                { username: req.session.username, verified: true },
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
      username: req.session.username,
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
      username: req.session.username,
      verified: true,
    });

    let userTeamExists;
    if (ObjectId.isValid(userToCheck.teamId)) {
      userTeamExists = await teams.findById(userToCheck.teamId);
    }

    if (!userTeamExists) {
      if (teamCodeExists.users.length < 4) {
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
                },
              },
            },
            { returnOriginal: false }
          )
          .then(async function (team) {
            await users
              .findOneAndUpdate(
                { username: req.session.username, verified: true },
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

  if (page <= 0) {
    res.send({ state: "error", message: "Page cannot be less than 1!" });
  } else {
    let teamCount = await teams.count();
    if ((page - 1) * 100 > teamCount) {
      res.send({ state: "error", message: "No more pages!" });
    } else {
      if (isNaN(page)) {
        page = 1;
      }

      let allTeams = [];
      try {
        allTeams = await teams
          .aggregate([
            {
              $match: {
                name: new RegExp(search, "i"),
                $or: [
                  {
                    users: {
                      $elemMatch: { username: req.session.username },
                    },
                  },
                  {
                    users: {
                      $not: {
                        $elemMatch: { shadowBanned: false },
                      },
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                oldUsers: "$users",
              },
            },
            {
              $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$users.solved",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$_id",
                users: { $first: "$oldUsers" },
                oldUsers: { $first: "$oldUsers" },
                solved: { $push: "$users.solved" },
                name: { $first: "$name" },
                teamCaptain: { $first: "$teamCaptain" },
              },
            },
            {
              $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$users.hintsBought",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$_id",
                users: { $first: "$oldUsers" },
                oldUsers: { $first: "$oldUsers" },
                solved: { $first: "$solved" },
                hintsCost: { $sum: "$users.hintsBought.cost" },
                name: { $first: "$name" },
                teamCaptain: { $first: "$teamCaptain" },
              },
            },
            {
              $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$_id",
                userIds: { $push: { $toString: "$users._id" } },
                users: { $first: "$oldUsers" },
                oldUsers: { $first: "$oldUsers" },
                solved: { $first: "$solved" },
                hintsCost: { $first: "$hintsCost" },
                name: { $first: "$name" },
                teamCaptain: { $first: "$teamCaptain" },
              },
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
                let: {
                  chalId: "$solved._id",
                  timestamp: "$solved.timestamp",
                  userIds: "$userIds",
                },
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
                        points: {
                          $cond: {
                            if: { $in: ["$firstBlood", "$$userIds"] },
                            then: { $add: ["$points", "$firstBloodPoints"] },
                            else: "$points",
                          },
                        },
                        timestamp: "$$timestamp",
                      },
                    },
                  },
                  {
                    $replaceRoot: { newRoot: "$solve" },
                  },
                ],
                as: "newSolved",
              },
            },
            {
              $unwind: {
                path: "$newSolved",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$_id",
                users: { $first: "$oldUsers" },
                totalScore: { $sum: "$newSolved.points" },
                totalSolved: {
                  $sum: {
                    $cond: { if: "$newSolved.points", then: 1, else: 0 },
                  },
                },
                solved: { $push: "$newSolved" },
                maxTimestamp: { $max: "$newSolved.timestamp" },
                name: { $first: "$name" },
                teamCaptain: { $first: "$teamCaptain" },
                hintsCost: { $first: "$hintsCost" },
              },
            },
            {
              $addFields: {
                totalScore: { $subtract: ["$totalScore", "$hintsCost"] },
              },
            },
          ])
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
  if (ObjectId.isValid(req.body.teamId)) {
    try {
      let team = await teams.aggregate([
        {
          $match: { _id: ObjectId(req.body.teamId) },
        },
        {
          $unwind: {
            path: "$users",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$users.solved",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "challenges",
            let: {
              chalId: "$users.solved._id",
              timestamp: "$users.solved.timestamp",
              userId: { $toString: "$users._id" },
            },
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
                    points: {
                      $cond: {
                        if: { $eq: ["$firstBlood", "$$userId"] },
                        then: { $add: ["$points", "$firstBloodPoints"] },
                        else: "$points",
                      },
                    },
                    firstBlood: "$firstBlood",
                    name: "$name",
                    category: "$category",
                    timestamp: "$$timestamp",
                  },
                },
              },
              {
                $replaceRoot: { newRoot: "$solve" },
              },
            ],
            as: "users.solved",
          },
        },
        {
          $group: {
            _id: "$_id",
            users: { $push: "$users" },
            name: { $first: "$name" },
            teamCaptain: { $first: "$teamCaptain" },
          },
        },
      ]);

      if (team[0]) {
        team[0].inviteCode = "Nice try XD";
        res.send(team[0]);
      } else {
        res.send({ state: "error" });
      }
    } catch (err) {
      console.log(err);
      res.send({ state: "error" });
    }
  }
};

exports.leaveTeam = async function (req, res) {
  const userToCheck = await users.findOne({
    username: req.session.username,
    verified: true,
  });

  let userTeamExists;
  if (ObjectId.isValid(userToCheck.teamId)) {
    userTeamExists = await teams.findById(userToCheck.teamId);
  }

  if (userTeamExists) {
    let newTeamUsers = userTeamExists.users.filter(
      (user) => user._id != userToCheck._id
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
            { username: req.session.username, verified: true },
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
  let team = await teams.aggregate([
    {
      $match: { name: decodeURIComponent(req.body.teamName.trim()) },
    },
    {
      $unwind: {
        path: "$users",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$users.solved",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "challenges",
        let: {
          chalId: "$users.solved._id",
          timestamp: "$users.solved.timestamp",
          userId: { $toString: "$users._id" },
        },
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
                points: {
                  $cond: {
                    if: { $eq: ["$firstBlood", "$$userId"] },
                    then: { $add: ["$points", "$firstBloodPoints"] },
                    else: "$points",
                  },
                },
                firstBlood: "$firstBlood",
                name: "$name",
                category: "$category",
                timestamp: "$$timestamp",
              },
            },
          },
          {
            $replaceRoot: { newRoot: "$solve" },
          },
        ],
        as: "users.solved",
      },
    },
    {
      $group: {
        _id: "$_id",
        users: { $push: "$users" },
        name: { $first: "$name" },
        teamCaptain: { $first: "$teamCaptain" },
      },
    },
  ]);

  if (team[0]) {
    team[0].inviteCode = "Nice try XD";

    res.send(team[0]);
  } else {
    res.send({ state: "error", message: "Team not found" });
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
    if (userTeamExists.teamCaptain === req.session.username) {
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
    res.send({ state: "error", message: "Use is not in a team!" });
  }
};
