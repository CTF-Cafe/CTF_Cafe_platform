const users = require('../models/userModel');
const crypto = require("crypto");
const { v4 } = require('uuid');
const ctfConfig = require('../models/ctfConfigModel.js');
const theme = require('../models/themeModel.js');
const teams = require('../models/teamModel.js');
const challenges = require('../models/challengeModel');

exports.login = async function(req, res) {
    const username = req.body.username.trim();
    const password = crypto.createHash('sha256').update(req.body.password.trim()).digest('hex');

    const user = await users.findOne({ username: username });

    if (user) {
        if (user.password === password) {
            const newKey = v4();

            req.session.username = username;
            req.session.key = newKey;
            await users.updateOne({ username: username }, { key: newKey.toString() });
            res.send({ state: 'success', message: 'Logged In', user: user });
        } else {
            res.send({ state: 'error', message: 'Wrong Credidentials' });
        }
    } else {
        res.send({ state: 'error', message: 'Wrong Credidentials' });
    }
}

exports.logout = async function(req, res) {
    req.session.username = undefined;
    req.session.key = undefined;
    res.sendStatus(200);
}

exports.register = async function(req, res) {
    const username = req.body.username.trim();
    const password = crypto.createHash('sha256').update(req.body.password.trim()).digest('hex');
    const startTime = await ctfConfig.findOne({ name: 'startTime' });

    if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) >= 0) {
        if (username.length >= 4) {
            if (username.length > 32) {
                res.send({ state: 'error', message: 'Username is to long! 32 characters maximum!' });
            } else {
                if (req.body.password.trim().length < 8) {
                    res.send({ state: 'error', message: 'Password is to short 8 characters minimum!!' });
                } else {
                    const userExists = await users.findOne({ username: username });

                    if (!userExists) {
                        const newKey = v4();

                        await users.create({ username: username, password: password, key: newKey.toString(), isAdmin: false }).then(async function(user) {

                            req.session.username = username;
                            req.session.key = newKey;
                            res.send({ state: 'success', message: 'Registered!', user: user });
                        }).catch(function(err) {
                            res.send({ state: 'error', message: 'User creation failed!' });
                        });
                    } else {
                        res.send({ state: 'error', message: 'User name Exists!' });
                    }
                }
            }
        } else {
            res.send({ state: 'error', message: 'Username is to short! 4 characters minimum!' });
        }
    } else {
        res.send({ state: 'error', message: 'Registrations are closed!' });
    }
}

exports.getUsers = async function(req, res) {
    let page = req.body.page;

    if (page <= 0) {
        res.send({ state: 'error', message: 'Page cannot be less than 1!' });
    } else {
        let userCount = await users.count();
        if (((page - 1) * 100) > userCount) {
            res.send({ state: 'error', message: 'No more pages!' });
        } else {
            if (isNaN(page)) {
                page = 1;
            }

            let allUsers = [];
            try {
                allUsers = await users.find({}).sort({ score: -1, _id: 1 }).skip((page - 1) * 100).limit(100);
            } catch (err) {
                allUsers = await users.find({}).sort({ score: -1, _id: 1 });
            }

            await allUsers.forEach(user => {
                user.password = 'Nice try XD';
                user.key = 'Nice try XD';
                user.isAdmin = false;
            });

            res.send(allUsers);
        }
    }

}

exports.getUser = async function(req, res) {
    let user = await users.findOne({ username: decodeURIComponent(req.body.username.trim()) });


    if (user) {
        user.password = 'Nice try XD';
        user.key = 'Nice try XD';
        user.isAdmin = false;

        res.send(user);
    } else {
        res.send({ state: 'error', message: 'User not found' })
    }

}

exports.getEndTime = async function(req, res) {
    const endTime = await ctfConfig.findOne({ name: 'endTime' });

    res.send(endTime.value.toString());
}


exports.getRules = async function(req, res) {
    const rules = await ctfConfig.findOne({ name: 'rules' });

    res.send(rules.value);
}

exports.getTheme = async function(req, res) {
    const currentTheme = await theme.findOne({});

    if (currentTheme) {
        res.send({ state: 'success', theme: currentTheme });
    } else {
        res.send({ state: 'error', message: 'No Theme!' });
    }
}

exports.getScoreboard = async function(req, res) {
    let allTeams = await teams.aggregate([{
        "$project": {
            "name": 1,
            "users": 1,
            "totalScore": {
                "$sum": "$users.score"
            },
            "lastTime": {
                "$sum": {
                    "$users": {
                        "$project": {
                            "lastTime": "$solved.timestamp"
                        }
                    }
                }
            }
        }
    }, {
        '$sort': {
            'totalScore': -1,
            'lastTime': -1
        }
    }]);

    console.log(allTeams[0].users, allTeams[0].lastTime, allTeams[1].users, allTeams[1].lastTime)

    let finalData = {
        standings: []
    }

    for (let i = 0; i < allTeams.length; i++) {
        if (allTeams[i].totalScore > 0) {
            finalData.standings.push({
                pos: i + 1,
                team: allTeams[i].name,
                score: allTeams[i].totalScore
            })
        }
    }

    res.send(finalData);
}

// {
//     "standings": [
//         { "pos": 1, "team": "Intergalactic Pwners", "score": 1700 },
//         { "pos": 2, "team": "h4ckmeifyouc4n", "score": 1200 },
//         { "pos": 3, "team": "MV Tech", "score": 100 }
//     ]
// }