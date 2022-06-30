const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js');
const teamController = require('../controllers/teamController.js');
const users = require('../models/userModel.js');
const teams = require('../models/teamModel.js');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.post('/login', (req, res) => {
    userController.login(req, res);
});

router.get('/logout', (req, res) => {
    userController.logout(req, res);
});

router.post('/register', (req, res) => {
    userController.register(req, res);
});

router.post('/getUsers', (req, res) => {
    userController.getUsers(req, res);
});

router.post('/getUser', (req, res) => {
    userController.getUser(req, res);
});

router.post('/getTeam', (req, res) => {
    teamController.getTeam(req, res);
});

router.post('/getTeams', (req, res) => {
    teamController.getTeams(req, res);
});

router.get('/getScoreboard', (req, res) => {
    userController.getScoreboard(req, res);
});

router.get('/getEndTime', (req, res) => {
    userController.getEndTime(req, res);
});

router.get('/getConfigs', (req, res) => {
    userController.getConfigs(req, res);
});

router.get('/checkSession', (req, res) => {
    users.findOne({ username: req.session.username }).then(async function(user) {
        if (!user) {
            res.send({ state: 'sessionError' })
        } else if (!(user.key == req.session.key)) {
            res.send({ state: 'sessionError' })
        } else {

            if (ObjectId.isValid(user.teamId)) {

                let team = await teams.aggregate([{
                        "$match": { "_id": ObjectId(user.teamId) }
                    }, {
                        "$unwind": {
                            "path": "$users",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        "$unwind": {
                            "path": "$users.solved",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        $lookup: {
                            from: "challenges",
                            let: { "chalId": "$users.solved._id", "timestamp": "$users.solved.timestamp" },
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
                            as: "users.solved"
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
                                            points: "$points",
                                            timestamp: "$$timestamp",
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
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            users: { $first: "$users" },
                            totalScore: { $sum: "$newSolved.points" },
                            totalSolved: { $sum: 1 },
                            maxTimestamp: { $max: "$newSolved.timestamp" },
                            name: { $first: "$name" },
                        }
                    },
                ]);

                if (team[0]) {
                    team[0].inviteCode = 'Nice try XD';

                    res.send({ state: 'success', user: user, team: team[0] });
                } else {
                    res.send({ state: 'success', user: user })
                }
            } else {
                res.send({ state: 'success', user: user })
            }
        }
    });
});

router.get('/getTheme', (req, res) => {
    userController.getTheme(req, res);
});

module.exports = router;