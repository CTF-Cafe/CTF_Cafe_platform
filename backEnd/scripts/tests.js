const mongoose = require('mongoose');
const db = mongoose.connection;
const dotenv = require('dotenv');
dotenv.config()

const users = require('../models/userModel.js');
const teams = require('../models/teamModel.js');
const challenges = require('../models/challengeModel.js');
const ObjectId = mongoose.Types.ObjectId;


mongoose.connect(process.env.MONGODB_CONNSTRING, { useNewUrlParser: true, useUnifiedTopology: true });

db.once("open", async function() {
    console.log("Database Connected successfully");


    const teamsFound = await teams.aggregate([{
            "$unwind": {
                "path": "$users",

            }
        },
        {
            $group: {
                _id: "$_id",
                users: { $push: "$users" },
                solved: { $first: "$users.solved" },
                name: { $first: "$name" },
            }
        },
        {
            "$unwind": {
                "path": "$solved",

            }
        },
        {
            $lookup: {
                from: "challenges",
                let: { "chalId": "$solved._id", "timestamp": "$solved.timestamp" },
                pipeline: [{
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
                            }
                        }
                    },
                    {
                        $replaceRoot: { newRoot: "$solve" }
                    }
                ],
                as: "newSolved"
            }
        },
        {
            "$unwind": {
                "path": "$newSolved",

            }
        },
        {
            $group: {
                _id: "$_id",
                users: { $first: "$users" },
                totalScore: { $sum: "$newSolved.points" },
            }
        }
    ]);

    console.log(teamsFound[1])

    process.exit(0);
});