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


    const usersFound = await users.aggregate([{
            "$unwind": {
                "path": "$solved",
                "preserveNullAndEmptyArrays": true
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
                                challenge: { points: "$points", name: "$name", _id: "$_id" },
                                timestamp: "$$timestamp",
                                points: "$points",
                            }
                        }
                    },
                    {
                        $replaceRoot: { newRoot: "$solve" }
                    }
                ],
                as: "solved"
            }
        },
        {
            "$unwind": {
                "path": "$solved",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $group: {
                _id: "$_id",
                username: { $first: "$username" },
                score: { $sum: "$solved.points" },
                solved: { $push: "$solved" },
                isAdmin: { $first: "$isAdmin" }
            }
        }
    ])

    console.log(usersFound, usersFound[1])

    process.exit(0);
});