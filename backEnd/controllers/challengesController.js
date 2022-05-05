const challenges = require('../models/challengeModel');
const users = require('../models/userModel');
const teams = require('../models/teamModel');
const ctfConfig = require('../models/ctfConfigModel.js');
const ObjectId = require('mongoose').Types.ObjectId;
const rateLimiterLow = require('./rateLimiters/low.js');

exports.getChallenges = async function(req, res) {
    let allChallenges = await challenges.find({});
    const startTime = await ctfConfig.findOne({ name: 'startTime' });
    const endTime = await ctfConfig.findOne({ name: 'endTime' });
    let categories = [];

    if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) >= 0) {
        res.send({ state: 'error', message: 'CTF has not started!', startTime: startTime.value });
    } else {
        await allChallenges.forEach(challenge => {
            challenge.flag = 'Nice try XD'
            if (categories.indexOf(challenge.category) == -1) categories.push(challenge.category);
        });

        res.send({ categories: categories, challenges: allChallenges, endTime: endTime.value });
    }

}


exports.submitFlag = async function(req, res) {
    const endTime = await ctfConfig.findOne({ name: 'endTime' });
    const startTime = await ctfConfig.findOne({ name: 'startTime' });

    if (parseInt(endTime.value) - (Math.floor((new Date()).getTime() / 1000)) <= 0) {
        res.send({ state: 'error', message: 'CTF is Over!' });
    } else if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) >= 0) {
        res.send({ state: 'error', message: 'CTF has not started!' });
    } else {
        const username = (req.session.username);
        const flag = (req.body.flag.trim());
        const user = await users.findOne({ username: username });

        const rlResUsernameFlag = await rateLimiterLow.rateLimiter.get(username);

        if (rlResUsernameFlag !== null && rlResUsernameFlag.consumedPoints > rateLimiterLow.maxPoints) {
            const retrySecs = Math.round(rlResUsernameFlag.msBeforeNext / 1000) || 1;
            res.set('Retry-After', String(retrySecs));
            res.send({ state: 'error', message: 'To Many Requests!' });
        } else {
            if (user) {
                let checkFlag = await challenges.findOne({ flag: flag });

                if (checkFlag) {
                    if (checkFlag.flag === flag) {
                        checkFlag.flag = 'Nice try XD';

                        if (user.solved.filter(obj => { return obj.challenge._id.equals(checkFlag._id) }).length > 0) {
                            try {
                                await rateLimiterLow.rateLimiter.consume(username);

                                res.send({ state: 'error', message: 'Already Solved!' });
                            } catch (rlRejected) {
                                if (rlRejected instanceof Error) {
                                    throw rlRejected;
                                } else {
                                    res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                                    res.send({ state: 'error', message: 'To Many Requests!' });
                                }
                            }
                        } else {

                            if (ObjectId.isValid(user.teamId)) {

                                const team = await teams.findById(user.teamId);

                                if (team) {
                                    if (team.users.filter(user => {
                                            return (user.solved.filter(obj => {
                                                return obj.challenge._id.equals(checkFlag._id)
                                            }).length > 0)
                                        }).length > 0) {

                                        try {
                                            await rateLimiterLow.rateLimiter.consume(username);

                                            res.send({ state: 'error', message: 'Already Solved!' });
                                        } catch (rlRejected) {
                                            if (rlRejected instanceof Error) {
                                                throw rlRejected;
                                            } else {
                                                res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                                                res.send({ state: 'error', message: 'To Many Requests!' });
                                            }
                                        }

                                    } else {
                                        let timestamp = new Date().getTime();

                                        await users.updateOne({ username: username }, { $push: { solved: { _id: checkFlag._id, challenge: checkFlag, timestamp: timestamp } } });
                                        await users.updateOne({ username: username }, { $inc: { score: checkFlag.points } });

                                        const updatedUser = await users.findOne({ username: username });

                                        await teams.updateOne({
                                            _id: team._id,
                                            users: { $elemMatch: { username: updatedUser.username } }
                                        }, {
                                            $set: {
                                                "users.$.solved": updatedUser.solved,
                                                "users.$.score": updatedUser.score,
                                            }
                                        });

                                        await challenges.updateOne({ flag: flag }, { $inc: { solveCount: 1 } });

                                        if (rlResUsernameFlag !== null && rlResUsernameFlag.consumedPoints > 0) {
                                            // Reset on successful authorisation
                                            await rateLimiterLow.rateLimiter.delete(username);
                                        }

                                        res.send({ state: 'success', user: updatedUser });
                                    }
                                } else {
                                    try {
                                        await rateLimiterLow.rateLimiter.consume(username);

                                        res.send({ state: 'error', message: 'Not in a team!' });
                                    } catch (rlRejected) {
                                        if (rlRejected instanceof Error) {
                                            throw rlRejected;
                                        } else {
                                            res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                                            res.send({ state: 'error', message: 'To Many Requests!' });
                                        }
                                    }
                                }
                            } else {
                                try {
                                    await rateLimiterLow.rateLimiter.consume(username);

                                    res.send({ state: 'error', message: 'Not in a Team!' });
                                } catch (rlRejected) {
                                    if (rlRejected instanceof Error) {
                                        throw rlRejected;
                                    } else {
                                        res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                                        res.send({ state: 'error', message: 'To Many Requests!' });
                                    }
                                }
                            }
                        }
                    } else {
                        try {
                            await rateLimiterLow.rateLimiter.consume(username);

                            res.send({ state: 'error', message: 'Wrong Flag :(' });
                        } catch (rlRejected) {
                            if (rlRejected instanceof Error) {
                                throw rlRejected;
                            } else {
                                res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                                res.send({ state: 'error', message: 'To Many Requests!' });
                            }
                        }
                    }
                } else {
                    try {
                        await rateLimiterLow.rateLimiter.consume(username);

                        res.send({ state: 'error', message: 'Wrong Flag :(' });
                    } catch (rlRejected) {
                        if (rlRejected instanceof Error) {
                            throw rlRejected;
                        } else {
                            res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                            res.send({ state: 'error', message: 'To Many Requests!' });
                        }
                    }
                }
            } else {
                res.send({ state: 'error', message: 'Not logged in!' });
            }
        }
    }
}