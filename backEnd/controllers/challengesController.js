const challenges = require('../models/challengeModel');
const users = require('../models/userModel');
const teams = require('../models/teamModel');
const ctfConfig = require('../models/ctfConfigModel.js');
const ObjectId = require('mongoose').Types.ObjectId;

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

accentsTidy = function(s) {
    var r = s.toLowerCase();
    r = r.replace(new RegExp("\\s", 'g'), "");
    r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
    r = r.replace(new RegExp("æ", 'g'), "ae");
    r = r.replace(new RegExp("ç", 'g'), "c");
    r = r.replace(new RegExp("[èéêë]", 'g'), "e");
    r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
    r = r.replace(new RegExp("ñ", 'g'), "n");
    r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
    r = r.replace(new RegExp("œ", 'g'), "oe");
    r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
    r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
    r = r.replace(new RegExp("\\W", 'g'), "");
    return r;
};

exports.submitFlag = async function(req, res) {
    const endTime = await ctfConfig.findOne({ name: 'endTime' });
    const startTime = await ctfConfig.findOne({ name: 'startTime' });

    if (parseInt(endTime.value) - (Math.floor((new Date()).getTime() / 1000)) <= 0) {
        res.send({ state: 'error', message: 'CTF is Over!' });
    } else if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) >= 0) {
        res.send({ state: 'error', message: 'CTF has not started!' });
    } else {
        const username = (req.session.username);
        const flag = accentsTidy(req.body.flag.trim()).toUpperCase();
        const user = await users.findOne({ username: username });

        if (user) {
            let checkFlag = await challenges.findOne({ flag: flag });

            if (checkFlag) {
                if (checkFlag.flag === flag) {
                    checkFlag.flag = 'Nice try XD';

                    if (user.solved.filter(obj => { return obj.challenge._id.equals(checkFlag._id) }).length > 0) {
                        res.send({ state: 'error', message: 'Already Solved!' });
                    } else {

                        if (ObjectId.isValid(user.teamId)) {

                            const team = await teams.findById(user.teamId);

                            if (team) {
                                if (team.users.filter(user => {
                                        return (user.solved.filter(obj => {
                                            return obj.challenge._id.equals(checkFlag._id)
                                        }).length > 0)
                                    }).length > 0) {
                                    res.send({ state: 'error', message: 'Already Solved!' });
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

                                    res.send({ state: 'success', user: updatedUser });
                                }
                            } else {
                                res.send({ state: 'error', message: 'Not in a team!' });
                            }
                        } else {
                            res.send({ state: 'error', message: 'Not in a team!' });
                        }
                    }
                } else {
                    res.send({ state: 'error', message: 'Wrong Flag :(' });
                }
            } else {
                res.send({ state: 'error', message: 'Wrong Flag :(' });
            }
        } else {
            res.send({ state: 'error', message: 'Not logged in!' });
        }
    }
}