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
    return r;
};

let currentlySubmittingUsers = [];
let currentlySubmittingTeams = [];

exports.submitFlag = async function(req, res) {
    let teamId = undefined;
    try {

        // Check if flag is provided
        if (!req.body.flag) {
            throw new Error('No flag provided!');
        }

        // Check if user is currently submitting flag
        if (currentlySubmittingUsers.includes(req.session.username)) {
            throw new Error('Submiting to fast!');
        }

        currentlySubmittingUsers.push(req.session.username);

        const endTime = await ctfConfig.findOne({ name: 'endTime' });
        const startTime = await ctfConfig.findOne({ name: 'startTime' });

        if (parseInt(endTime.value) - (Math.floor((new Date()).getTime() / 1000)) <= 0) {
            throw new Error('CTF is Over!');
        } else if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) >= 0) {
            throw new Error('CTF has not started!');
        }

        const username = (req.session.username);
        const flag = accentsTidy(req.body.flag.trim()).toUpperCase();
        const user = await users.findOne({ username: username });

        // Check if user exists
        if (!user) {
            throw new Error('Not logged in!');
        }

        let checkFlag = await challenges.findOne({ flag: flag });

        // Check if a challenge has the flag
        if (!checkFlag) {
            throw new Error('Wrong Flag :(');
        }

        // Double check flags
        if (checkFlag.flag != flag) {
            throw new Error('Wrong Flag :(');
        }

        checkFlag.flag = 'Nice try XD';

        // Check if challenge is already solved
        if (user.solved.filter(obj => { return obj.challenge._id.equals(checkFlag._id) }).length > 0) {
            throw new Error('Already Solved!');
        }

        // Check teamId is valid
        if (!ObjectId.isValid(user.teamId)) {
            throw new Error('Not in a team!')
        }

        const team = await teams.findById(user.teamId);

        // Check Team Exists
        if (!team) {
            throw new Error('Not in a team!')
        }

        // Check if team is currently submitting
        if (currentlySubmittingTeams.includes(user.teamId)) {
            throw new Error('Submiting to fast!')
        }

        currentlySubmittingTeams.push(user.teamId);
        teamId = user.teamId;

        if (team.users.filter(user => {
                return (user.solved.filter(obj => {
                    return obj.challenge._id.equals(checkFlag._id)
                }).length > 0)
            }).length > 0) {

            throw new Error('Already Solved!')
        }

        let timestamp = new Date().getTime();

        if (checkFlag.firstBlood == 'none') {
            checkFlag.firstBlood = username;
        }

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

        if (checkFlag.firstBlood == 'none' || checkFlag.firstBlood == username) {
            await challenges.updateOne({ flag: flag }, { $inc: { solveCount: 1 }, firstBlood: updatedUser.username });
        } else {
            await challenges.updateOne({ flag: flag }, { $inc: { solveCount: 1 } });
        }

        res.send({ state: 'success', user: updatedUser });

    } catch (err) {
        if (err) {
            res.send({ state: 'error', message: err.message });
        }
    } finally {
        currentlySubmittingUsers = currentlySubmittingUsers.filter(item => item !== req.session.username)

        if (teamId) {
            currentlySubmittingTeams = currentlySubmittingTeams.filter(item => item !== teamId)
        }
    }
}