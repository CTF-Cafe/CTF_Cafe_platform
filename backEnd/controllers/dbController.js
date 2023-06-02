const teams = require("../models/teamModel");
const users = require("../models/userModel");

// TODO : FIX ITEM COLLISIONS BETWEN PLAYERS
// Resolve all the team users solves and hintsBought and return everything
exports.resolveTeamsFull = function (match) {
  return teams.aggregate([
    {
      $match: match,
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
                points: "$points",
                firstBloodPoints: "$firstBloodPoints",
                firstBlood: "$firstBlood",
                name: "$name",
                tags: "$tags",
                timestamp: "$$timestamp",
                level: "$level"
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
        _id: { teamId: "$_id", userId: "$users._id" },
        solved: {
          $push: {
            $arrayElemAt: ["$users.solved", 0],
          },
        },
        hintsBought: { $first: "$users.hintsBought" },
        adminPoints: { $first: "$users.adminPoints" },
        username: { $first: "$users.username" },
        name: { $first: "$name" },
        teamCaptain: { $first: "$teamCaptain" },
        category: { $first: "$category" },
        country: { $first: "$country" },
      },
    },
    {
      $group: {
        _id: "$_id.teamId",
        users: {
          $push: {
            _id: "$_id.userId",
            username: "$username",
            solved: "$solved",
            hintsBought: "$hintsBought",
            adminPoints: "$adminPoints",
          },
        },
        name: { $first: "$name" },
        teamCaptain: { $first: "$teamCaptain" },
        country: { $first: "$country" },
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
      $lookup: {
        from: "challenges",
        let: {
          chalId: "$users.hintsBought.challId",
          timestamp: "$users.hintsBought.timestamp",
          hintId: "$users.hintsBought.hintId",
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
              hintBought: {
                hintId: "$$hintId",
                challId: "$_id",
                cost: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$hints",
                            cond: { $eq: ["$$this.id", "$$hintId"] },
                          },
                        },
                        as: "h",
                        in: "$$h.cost",
                      },
                    },
                    0,
                  ],
                },
                timestamp: "$$timestamp",
                challName: "$name",
              },
            },
          },
          {
            $replaceRoot: { newRoot: "$hintBought" },
          },
        ],
        as: "users.hintsBought",
      },
    },
    {
      $group: {
        _id: { teamId: "$_id", userId: "$users._id" },
        hintsBought: {
          $push: {
            $arrayElemAt: ["$users.hintsBought", 0],
          },
        },
        solved: { $first: "$users.solved" },
        adminPoints: { $first: "$users.adminPoints" },
        username: { $first: "$users.username" },
        name: { $first: "$name" },
        teamCaptain: { $first: "$teamCaptain" },
        category: { $first: "$category" },
        country: { $first: "$country" },
      },
    },
    {
      $group: {
        _id: "$_id.teamId",
        users: {
          $push: {
            _id: "$_id.userId",
            username: "$username",
            solved: "$solved",
            hintsBought: "$hintsBought",
            adminPoints: "$adminPoints",
            score: 0,
          },
        },
        name: { $first: "$name" },
        teamCaptain: { $first: "$teamCaptain" },
        category: { $first: "$category" },
        country: { $first: "$country" },
      },
    },
  ]);
};

// Resolve all the team users solves and hintsBought and return the summed score and the solvecount with solved
exports.resolveTeamsMin = function (match) {
  return teams.aggregate([
    {
      $match: match,
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
        category: { $first: "$category" },
        country: { $first: "$country" },
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
        hintsBought: { $push: "$users.hintsBought" },
        name: { $first: "$name" },
        teamCaptain: { $first: "$teamCaptain" },
        category: { $first: "$category" },
        country: { $first: "$country" },
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
        hintsBought: { $first: "$hintsBought" },
        adminPoints: { $sum: "$users.adminPoints" },
        name: { $first: "$name" },
        teamCaptain: { $first: "$teamCaptain" },
        category: { $first: "$category" },
        country: { $first: "$country" },
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
                level: "$level"
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
        hintsBought: { $first: "$hintsBought" },
        adminPoints: { $first: "$adminPoints" },
        category: { $first: "$category" },
        country: { $first: "$country" },
      },
    },
    {
      $unwind: {
        path: "$hintsBought",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "challenges",
        let: {
          chalId: "$hintsBought.challId",
          timestamp: "$hintsBought.timestamp",
          hintId: "$hintsBought.hintId",
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
              hintBought: {
                hintId: "$$hintId",
                challId: "$_id",
                cost: {
                  $toInt: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$hints",
                              cond: { $eq: ["$$this.id", "$$hintId"] },
                            },
                          },
                          as: "h",
                          in: "$$h.cost",
                        },
                      },
                      0,
                    ],
                  },
                },
                timestamp: "$$timestamp",
                challName: "$name",
                level: "$level"
              },
            },
          },
          {
            $replaceRoot: { newRoot: "$hintBought" },
          },
        ],
        as: "hintsBought",
      },
    },
    {
      $unwind: {
        path: "$hintsBought",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        solved: { $first: "$solved" },
        hintsBought: { $push: "$hintsBought" },
        totalScore: { $first: "$totalScore" },
        totalSolved: {
          $first: "$totalSolved",
        },
        hintsCost: { $sum: "$hintsBought.cost" },
        adminPoints: { $first: "$adminPoints" },
        maxTimestamp: { $first: "$maxTimestamp" },
        category: { $first: "$category" },
        country: { $first: "$country" },
      },
    },
    {
      $addFields: {
        totalScore: {
          $subtract: [{ $add: ["$totalScore", "$adminPoints"] }, "$hintsCost"],
        },
      },
    },
  ]);
};

// Resolve all the user solves and hintsBought and return the summed score and the solvecount with solved
exports.resolveUsers = function (match) {
  return users.aggregate([
    {
      $match: match,
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
          challId: "$solved._id",
          timestamp: "$solved.timestamp",
          userId: { $toString: "$_id" },
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$challId", "$_id"] },
            },
          },
          {
            $project: {
              _id: 0,
              solve: {
                _id: "$_id",
                timestamp: "$$timestamp",
                points: {
                  $cond: {
                    if: { $eq: ["$firstBlood", "$$userId"] },
                    then: { $add: ["$points", "$firstBloodPoints"] },
                    else: "$points",
                  },
                },
                challenge: {
                  name: "$name",
                  tags: "$tags",
                  points: "$points",
                  firstBloodPoints: "$firstBloodPoints",
                  firstBlood: "$firstBlood",
                  level: "$level"
                }
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
        hintsBought: { $first: "$hintsBought" },
        adminPoints: { $first: "$adminPoints" },
        score: { $sum: "$solved.points" },
        solved: { $push: "$solved" },
        maxTimestamp: { $max: "$solved.timestamp" },
        category: { $first: "$category" },
      },
    },
    {
      $unwind: {
        path: "$hintsBought",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "challenges",
        let: {
          chalId: "$hintsBought.challId",
          timestamp: "$hintsBought.timestamp",
          hintId: "$hintsBought.hintId",
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
              hintBought: {
                hintId: "$$hintId",
                challId: "$_id",
                cost: {
                  $toInt: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$hints",
                              cond: { $eq: ["$$this.id", "$$hintId"] },
                            },
                          },
                          as: "h",
                          in: "$$h.cost",
                        },
                      },
                      0,
                    ],
                  },
                },
                timestamp: "$$timestamp",
                challName: "$name",
              },
            },
          },
          {
            $replaceRoot: { newRoot: "$hintBought" },
          },
        ],
        as: "hintsBought",
      },
    },
    {
      $unwind: {
        path: "$hintsBought",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        username: { $first: "$username" },
        hintsCost: { $sum: "$hintsBought.cost" },
        score: { $first: "$score" },
        solved: { $first: "$solved" },
        hintsBought: { $push: "$hintsBought" },
        adminPoints: { $first: "$adminPoints" },
        maxTimestamp: { $first: "$maxTimestamp" },
        category: { $first: "$category" },
      },
    },
    {
      $addFields: {
        score: {
          $subtract: [{ $add: ["$score", "$adminPoints"] }, "$hintsCost"],
        },
      },
    },
  ]);
};

// Resolve one user solves and hintsBought and return the summed score and the solvecount with solved
exports.resolveUser = function (match) {
  return users.aggregate([
    {
      $match: match,
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
          challId: "$solved._id",
          timestamp: "$solved.timestamp",
          userId: { $toString: "$_id" },
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$challId", "$_id"] },
            },
          },
          {
            $project: {
              _id: 0,
              solve: {
                _id: "$_id",
                timestamp: "$$timestamp",
                points: {
                  $cond: {
                    if: { $eq: ["$firstBlood", "$$userId"] },
                    then: { $add: ["$points", "$firstBloodPoints"] },
                    else: "$points",
                  },
                },
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
        hintsBought: { $first: "$hintsBought" },
        adminPoints: { $first: "$adminPoints" },
        score: { $sum: "$solved.points" },
        solved: { $push: "$solved" },
        maxTimestamp: { $max: "$solved.timestamp" },
        category: { $first: "$category" },
      },
    },
    {
      $unwind: {
        path: "$hintsBought",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "challenges",
        let: {
          chalId: "$hintsBought.challId",
          timestamp: "$hintsBought.timestamp",
          hintId: "$hintsBought.hintId",
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
              hintBought: {
                hintId: "$$hintId",
                challId: "$_id",
                cost: {
                  $toInt: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$hints",
                              cond: { $eq: ["$$this.id", "$$hintId"] },
                            },
                          },
                          as: "h",
                          in: "$$h.cost",
                        },
                      },
                      0,
                    ],
                  },
                },
                timestamp: "$$timestamp",
                challName: "$name",
              },
            },
          },
          {
            $replaceRoot: { newRoot: "$hintBought" },
          },
        ],
        as: "hintsBought",
      },
    },
    {
      $unwind: {
        path: "$hintsBought",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        username: { $first: "$username" },
        hintsCost: { $sum: "$hintsBought.cost" },
        score: { $first: "$score" },
        solved: { $first: "$solved" },
        hintsBought: { $push: "$hintsBought" },
        adminPoints: { $first: "$adminPoints" },
        maxTimestamp: { $first: "$maxTimestamp" },
        category: { $first: "$category" },
      },
    },
    {
      $addFields: {
        score: {
          $subtract: [{ $add: ["$score", "$adminPoints"] }, "$hintsCost"],
        },
      },
    },
  ]);
}
