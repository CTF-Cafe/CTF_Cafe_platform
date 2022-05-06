const teams = require('../models/teamModel');
const users = require('../models/userModel');
const { v4 } = require('uuid');
const ctfConfig = require('../models/ctfConfigModel.js');
const ObjectId = require('mongoose').Types.ObjectId;

exports.register = async function(req, res) {
    const teamName = (req.body.teamName.trim());

    if (teamName.length > 32) {
        res.send({ state: 'error', message: 'Team name is to long!' });
    } else {
        const teamNameExists = await teams.findOne({ name: teamName });

        if (!teamNameExists) {

            const userToCheck = await users.findOne({ username: (req.session.username) });

            let userTeamExists;
            if (ObjectId.isValid(userToCheck.teamId)) {
                userTeamExists = await teams.findById(userToCheck.teamId);
            }

            if (!userTeamExists) {
                await teams.create({ name: teamName, inviteCode: v4(), users: [{ username: userToCheck.username, score: userToCheck.score, solved: userToCheck.solved }] }).then(async function(team) {
                    await users.findOneAndUpdate({ username: req.session.username }, { teamId: team.id }, { returnOriginal: false }).then(async function(user) {
                        res.send({ state: 'success', message: 'Registered team!', user: user, team: team });
                    });
                }).catch(function(err) {
                    console.log(err.message);
                    res.send({ state: 'error', message: 'Team creation failed!' });
                });
            } else {
                res.send({ state: 'error', message: 'Already in a team!' });
            }
        } else {
            res.send({ state: 'error', message: 'Team name Exists!' });
        }
    }
}

exports.getCode = async function(req, res) {
    const teamName = (req.body.teamName);

    const teamNameExists = await teams.findOne({ name: teamName });

    if (teamNameExists) {
        const userHasTeam = await users.findOne({ username: (req.session.username) });
        if (userHasTeam.teamId == teamNameExists.id) {
            res.send({ state: 'success', code: teamNameExists.inviteCode })
        }
    } else {
        res.send({ state: 'error', message: 'Team dosnt exist!' });
    }
}


exports.joinTeam = async function(req, res) {
    const teamCode = (req.body.teamCode);

    const teamCodeExists = await teams.findOne({ inviteCode: teamCode });

    if (teamCodeExists) {
        const userToCheck = await users.findOne({ username: (req.session.username) });

        let userTeamExists;
        if (ObjectId.isValid(userToCheck.teamId)) {
            userTeamExists = await teams.findById(userToCheck.teamId);
        }

        if (!userTeamExists) {
            if (teamCodeExists.users.length < 4) {
                await teams.findOneAndUpdate({ inviteCode: teamCode }, { $push: { users: { username: userToCheck.username, score: userToCheck.score, solved: userToCheck.solved } } }, { returnOriginal: false }).then(async function(team) {
                    await users.findOneAndUpdate({ username: req.session.username }, { teamId: team.id }, { returnOriginal: false }).then(async function(user) {
                        res.send({ state: 'success', message: 'Joined team!', user: user, team: team });
                    });
                }).catch(error => {
                    res.send({ state: 'error', message: error.messsage });
                });
            } else {
                res.send({ state: 'error', message: 'Team is full!' });
            }
        } else {
            res.send({ state: 'error', message: 'You already have a team!' });
        }
    } else {
        res.send({ state: 'error', message: 'Team code is invalid!' });
    }
}

exports.getTeams = async function(req, res) {
    let page = (req.body.page);

    if (page <= 0) {
        res.send({ state: 'error', message: 'Page cannot be less than 1!' });
    } else {
        let teamCount = await teams.count();
        if (((page - 1) * 100) > teamCount) {
            res.send({ state: 'error', message: 'No more pages!' });
        } else {
            if (isNaN(page)) {
                page = 1;
            }

            let allTeams = [];
            try {
                allTeams = await teams.aggregate([
                    { "$unwind": "$users" },
                    {
                        "$group": {
                            "_id": "$_id",
                            "totalScore": {
                                "$sum": "$users.score"
                            },
                            "users": "$users"
                        },
                        { "$sort": { "totalScore": -1 } },
                    }
                ], {
                    allowDiskUse: true
                }).skip((page - 1) * 100).limit(100);

                console.log(allTeams);
            } catch (err) {
                console.log(err.message);
                allTeams = await teams.find({}).sort({ 'users.score': -1, _id: 1 });
            }

            await allTeams.forEach(team => {
                team.inviteCode = 'Nice try XD';
            });

            res.send(allTeams);
        }
    }
}

exports.getUserTeam = async function(req, res) {
    if (ObjectId.isValid((req.body.teamId))) {

        let team = await teams.findById((req.body.teamId));

        if (team) {
            team.inviteCode = 'Nice try XD';
            res.send(team);
        } else {
            res.send({ state: 'error' })
        }
    }
}

exports.leaveTeam = async function(req, res) {

    const userToCheck = await users.findOne({ username: req.session.username });

    let userTeamExists;
    if (ObjectId.isValid(userToCheck.teamId)) {
        userTeamExists = await teams.findById(userToCheck.teamId);
    }

    if (userTeamExists) {

        let newTeamUsers = userTeamExists.users.filter(user => user.username != req.session.username);
        await teams.findOneAndUpdate({ _id: userTeamExists.id }, { $set: { users: newTeamUsers } }, { returnOriginal: false }).then(async function(team) {
            await users.findOneAndUpdate({ username: req.session.username }, { teamId: 'none' }, { returnOriginal: false }).then(async function(user) {
                if (team.users) {
                    if (team.users.length <= 0) {
                        await teams.findByIdAndRemove(team.id);
                    }
                }

                res.send({ state: 'success', message: 'Left team!', user: user, team: team });
            });
        });
    } else {
        res.send({ state: 'error', message: 'You are not in a team!' });
    }
}

exports.getTeam = async function(req, res) {
    let team = await teams.findOne({ name: req.body.teamName.replace(/%20/g, " ").trim() });

    if (team) {
        team.inviteCode = 'Nice try XD';

        res.send(team);
    } else {
        res.send({ state: 'error', message: 'Team not found' })
    }
}