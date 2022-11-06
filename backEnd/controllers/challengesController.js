const challenges = require('../models/challengeModel');
const users = require('../models/userModel');
const teams = require('../models/teamModel');
const ctfConfig = require('../models/ctfConfigModel.js');
const ObjectId = require('mongoose').Types.ObjectId;
var compose = require('docker-compose');
const path = require('path');

exports.getChallenges = async function (req, res) {
    let allChallenges = await challenges.find({}).sort({ points: 1 });
    const startTime = await ctfConfig.findOne({ name: 'startTime' });
    const endTime = await ctfConfig.findOne({ name: 'endTime' });
    let categories = [];

    if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) >= 0) {
        res.send({ state: 'error', message: 'CTF has not started!', startTime: startTime.value });
    } else {
        await allChallenges.forEach(challenge => {
            challenge.flag = 'Nice try XD'
            challenge.dockerCompose = challenge.dockerCompose.length > 0 ? true : false;
            if (categories.indexOf(challenge.category) == -1) categories.push(challenge.category);
        });

        res.send({ categories: categories, challenges: allChallenges, endTime: endTime.value });
    }

}

exports.launchDocker = async function (req, res) {
    try {
        const user = await users.findOne({ username: req.session.username });

        // Check teamId is valid
        if (!ObjectId.isValid(user.teamId)) {
            throw new Error('Not in a team!')
        }

        const team = await teams.findById(user.teamId);

        // Check Team Exists
        if (!team) {
            throw new Error('Not in a team!')
        }

        // Check challengeId is valid
        if (!ObjectId.isValid(req.body.challengeId)) {
            throw new Error('Invalid challengeId!')
        }

        const challenge = await challenges.findOne({ _id: ObjectId(req.body.challengeId) });

        if (!challenge) {
            throw new Error('Challenge does not exist!');
        }

        // Check if challenge is dockerized
        if (challenge.dockerCompose.length == 0) {
            throw new Error('Challenge is not dockerized!');
        }

        // check if user has already launched this challenge
        if (challenge.dockerLaunchers.find(item => item.team === team.id) == undefined && challenge.dockerLaunchers.find(item => item.user === user.id) == undefined) {
            try {

                // launch docker
                await compose.upAll({ cwd: path.join(__dirname, "../dockers/", challenge.dockerCompose, "/"), composeOptions: [["--verbose"], ["-p", challenge.dockerCompose + "_" + team.id]] });

                await challenges.updateOne({ _id: ObjectId(req.body.challengeId) }, { $push: { dockerLaunchers: { user: user.id, team: team.id } } });
            } catch (err) {
                console.log(err);
                throw new Error('Error launching docker!');
            }

            res.send({ state: 'success' });
        } else {
            throw new Error('You have already launched this challenge!');
        }

    } catch (err) {
        if (err) {
            res.send({ state: 'error', message: err.message });
        }
    }
}

exports.stopDocker = async function (req, res) {
    try {
        const user = await users.findOne({ username: req.session.username });

        // Check teamId is valid
        if (!ObjectId.isValid(user.teamId)) {
            throw new Error('Not in a team!')
        }

        const team = await teams.findById(user.teamId);
        
        // Check Team Exists
        if (!team) {
            throw new Error('Not in a team!')
        }

        // Check challengeId is valid
        if (!ObjectId.isValid(req.body.challengeId)) {
            throw new Error('Invalid challengeId!')
        }

        const challenge = await challenges.findOne({ _id: ObjectId(req.body.challengeId) });

        if (!challenge) {
            throw new Error('Challenge does not exist!');
        }

        // Check if challenge is dockerized
        if (challenge.dockerCompose.length == 0) {
            throw new Error('Challenge is not dockerized!');
        }

        // check if user has already launched this challenge
        if (challenge.dockerLaunchers.find(item => item.team === team.id) != undefined || challenge.dockerLaunchers.find(item => item.user === user.id) != undefined) {
           
            try {
                // stop docker
                await compose.stop({ cwd: path.join(__dirname, "../dockers/", challenge.dockerCompose, "/"), composeOptions: [["--verbose"], ["-p", challenge.dockerCompose + "_" + team.id]] });
                
                if (challenge.dockerLaunchers.find(item => item.team === team.id) != undefined) {
                    await challenges.updateOne({ _id: ObjectId(req.body.challengeId) }, { $pull: { dockerLaunchers: { team: team.id } } });
                } else {
                    await challenges.updateOne({ _id: ObjectId(req.body.challengeId) }, { $pull: { dockerLaunchers: { user: user.id } } });
                }

            } catch (err) {
                console.log(err);
                throw new Error('Error stopping docker!');
            }

            res.send({ state: 'success' });
        } else {
            throw new Error('You have not launched this challenge!');
        }

    } catch (err) {
        if (err) {
            res.send({ state: 'error', message: err.message });
        }
    }
}            

accentsTidy = function (s) {
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

exports.submitFlag = async function (req, res) {
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
        if (user.solved.filter(obj => { return obj._id.equals(checkFlag._id) }).length > 0) {
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
                return obj._id.equals(checkFlag._id)
            }).length > 0)
        }).length > 0) {

            throw new Error('Already Solved!')
        }

        let timestamp = new Date().getTime();

        if (checkFlag.firstBlood == 'none') {
            checkFlag.firstBlood = username;
        }

        await users.updateOne({ username: username }, { $push: { solved: { _id: checkFlag._id, timestamp: timestamp } } });
        // await users.updateOne({ username: username }, { $inc: { score: checkFlag.points } });

        const updatedUser = await users.findOne({ username: username });

        await teams.updateOne({
            _id: team._id,
            users: { $elemMatch: { username: updatedUser.username } }
        }, {
            $set: {
                "users.$.score": updatedUser.score,
                "users.$.solved": updatedUser.solved,
            }
        });

        if (checkFlag.firstBlood == 'none' || checkFlag.firstBlood == username) {
            await challenges.updateOne({ flag: flag }, { $inc: { solveCount: 1 }, firstBlood: updatedUser.username });
        } else {
            await challenges.updateOne({ flag: flag }, { $inc: { solveCount: 1 } });
        }

        updatedUser.password = undefined;
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