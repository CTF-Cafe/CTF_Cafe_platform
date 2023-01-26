const challenges = require('../models/challengeModel');
const users = require('../models/userModel');
const teams = require('../models/teamModel');
const ctfConfig = require('../models/ctfConfigModel.js');
const logController = require("./logController")
const ObjectId = require('mongoose').Types.ObjectId;
const path = require('path');
const cron = require('node-cron');
const crypto = require("crypto");
const fs = require('fs');
const axios = require('axios');

exports.getChallenges = async function (req, res) {
    let allChallenges = await challenges.find({}).sort({ points: 1 });
    const startTime = await ctfConfig.findOne({ name: 'startTime' });
    const endTime = await ctfConfig.findOne({ name: 'endTime' });
    let categories = [];

    if (parseInt(startTime.value) - (Math.floor((new Date()).getTime())) >= 0) {
        res.send({ state: 'error', message: 'CTF has not started!', startTime: startTime.value });
    } else {
        users.findOne({ username: req.session.username }).then(async (user) => {
            const deployed = await getDocker(user.teamId)
            let returnedChallenges = allChallenges.map(challenge => {
                let copy = {...challenge._doc, id: challenge.id}
                let challengeDeployed = deployed.find(d => d.challengeId == copy.id)
                if(challengeDeployed){
                    if(!challengeDeployed.progress){
                        copy.url = challengeDeployed.url
                        copy.progress = 'finished'
                    } else {
                        copy.progress = challengeDeployed.progress
                    }
                }
                
                delete copy.flag
                delete copy.githubUrl
                if (categories.indexOf(copy.category) == -1)
                    categories.push(copy.category);
                return copy
            });
            res.send({ categories: categories, challenges: returnedChallenges, endTime: endTime.value });
        }).catch((err) => {
            console.log(err);
            res.send({ state: 'error', message: err });
        });
    }

}

exports.deployDocker = async function (req, res) {
    try {
        const user = await users.findOne({ username: req.session.username });
        if(!user) throw new Error("User not found");
        if (!ObjectId.isValid(user.teamId)) throw new Error('Not in a team!')

        const team = await teams.findById(user.teamId);
        if (!team)  throw new Error('Not in a team!')
            
        const challenge = await challenges.findOne({ _id: ObjectId(req.body.challengeId) });

        if (!challenge) throw new Error('Challenge does not exist!');
        if (!challenge.isInstance) throw new Error('Challenge is not an instance!');
        if (!challenge.githubUrl) throw new Error('Challenge doesn\'t have a github url!');

        const resAxios = await axios.post(`${process.env.DEPLOYER_API}/instances`, {
            "githubUrl": challenge.githubUrl,
            "owner": user.teamId,
            "team": user.teamId,
            "challengeId": challenge.id
          }, {
            headers: {
                'X-API-KEY': process.env.DEPLOYER_SECRET
            }
          })
          res.send({state: 'success', message: resAxios.data})
    } catch (error) {
        if(error.response?.data?.message) return res.send({ state: 'error', message: error.response.data.message });
        res.send({ state: 'error', message: error.message });
    }

}

exports.shutdownDocker = async function (req, res) {
    try {
        const user = await users.findOne({ username: req.session.username });
        if(!user) throw new Error("User not found");
        if (!ObjectId.isValid(user.teamId)) throw new Error('Not in a team!')

        const team = await teams.findById(user.teamId);
        if (!team)  throw new Error('Not in a team!')
            
        const challenge = await challenges.findOne({ _id: ObjectId(req.body.challengeId) });

        if (!challenge) throw new Error('Challenge does not exist!');
        if (!challenge.isInstance) throw new Error('Challenge is not an instance!');
        if (!challenge.githubUrl) throw new Error('Challenge doesn\'t have a github url!');

        const resAxios = await axios.delete(`${process.env.DEPLOYER_API}/instances/${user.teamId}`,
            {
                headers: {
                    'X-API-KEY': process.env.DEPLOYER_SECRET
                }
            })
          res.send({state: 'success', message: resAxios.data})
    } catch (error) {
        if(error.response?.data?.message) return res.send({ state: 'error', message: error.response.data.message });
        res.send({ state: 'error', message: error.message });
    }
}

async function getDocker(teamId) {
    try {
        const deployed = await axios.get(`${process.env.DEPLOYER_API}/instances/team/${teamId}`, {
            headers: {
                'X-API-KEY': process.env.DEPLOYER_SECRET
            }
        })
    
        return deployed.data.map(c => {
            delete c.composeProjectName
            delete c.githubUrl
            return c
        })
    } catch (error) {
        return []
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

        if (parseInt(endTime.value) - (Math.floor((new Date()).getTime())) <= 0) {
            throw new Error('CTF is Over!');
        } else if (parseInt(startTime.value) - (Math.floor((new Date()).getTime())) >= 0) {
            throw new Error('CTF has not started!');
        }

        const username = (req.session.username);
        const flag = accentsTidy(req.body.flag.trim()).toUpperCase();
        const user = await users.findOne({ username: username, verified: true });

        // Check if user exists
        if (!user) {
            throw new Error('Not logged in!');
        }

        // Check challengeId is valid
        if (!ObjectId.isValid(req.body.challengeId)) {
            throw new Error('Invalid challengeId!')
        }

        let challenge = await challenges.findOne({ _id: ObjectId(req.body.challengeId) });

        if(challenge.randomFlag) {
            if (challenge.dockerLaunchers.find(launcher => launcher.team == user.teamId).flag != flag) {
                logController.createLog(req, user, { state: 'error', message: 'Wrong Flag :(' });
                throw new Error('Wrong Flag :(');
            }
        } else {
            // check flag
            if (challenge.flag != flag) {
                logController.createLog(req, user, { state: 'error', message: 'Wrong Flag :(' });
                throw new Error('Wrong Flag :(');
            }
        }

        challenge.flag = 'Nice try XD';

        // Check if challenge is already solved
        if (user.solved.filter(obj => { return obj._id.equals(challenge._id) }).length > 0) {
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
            logController.createLog(req, user, { state: 'error', message: 'Submiting too fast!' });
            throw new Error('Submiting too fast!')
        }

        currentlySubmittingTeams.push(user.teamId);
        teamId = user.teamId;

        if (team.users.filter(user => {
            return (user.solved.filter(obj => {
                return obj._id.equals(challenge._id)
            }).length > 0)
        }).length > 0) {

            throw new Error('Already Solved!')
        }

        let timestamp = new Date().getTime();

        if (challenge.firstBlood == 'none') {
            challenge.firstBlood = username;
        }

        const dynamicScoring = await ctfConfig.findOne({ name: 'dynamicScoring' });

        if(dynamicScoring.value.toString() == "true") {
            const decay = (await teams.countDocuments()) * 0.18;
            let dynamicPoints = Math.ceil((((challenge.minimumPoints - challenge.initialPoints)/((decay**2)+1)) * ((challenge.solveCount+1)**2)) + challenge.initialPoints)
            if(dynamicPoints < challenge.minimumPoints) { dynamicPoints = challenge.minimumPoints }

            // ALTERNATE WAY:
            // const decay = (await users.countDocuments()) * 0.18;
            // let dynamicPoints = ((challenge.minimumPoints - challenge.initialPoints) / ((decay**2)+1) * ((challenge.solveCount+1)**2))
            // if(dynamicPoints < challenge.minimumPoints) { dynamicPoints = challenge.minimumPoints } else { dynamicPoints += challenge.minimumPoints }

            await challenges.updateOne({ _id: ObjectId(req.body.challengeId) }, { $set: { points: dynamicPoints } });
            challenge = await challenges.findOne({ _id: ObjectId(req.body.challengeId) });
        }

        await users.updateOne({ username: username, verified: true }, { $push: { solved: { _id: challenge._id, timestamp: timestamp } } });

        const updatedUser = await users.findOne({ username: username, verified: true });

        await teams.updateOne({
            _id: team._id,
            users: { $elemMatch: { username: updatedUser.username } }
        }, {
            $set: {
                "users.$.score": updatedUser.score,
                "users.$.solved": updatedUser.solved,
            }
        });

        if (challenge.firstBlood == 'none' || challenge.firstBlood == username) {
            await challenges.updateOne({ _id: req.body.challengeId }, { $inc: { solveCount: 1 }, firstBlood: updatedUser.username });

            const currentNotifications = await ctfConfig.findOne({ name: 'notifications' });
            if (currentNotifications) {
                await ctfConfig.findOneAndUpdate({ name: 'notifications' }, { value: [...currentNotifications.value, ...[{ message: `${updatedUser.username} has first blood ${challenge.name}!`, type: "first_blood", seenBy: [] }]] });
            }
        } else {
            await challenges.updateOne({ _id: req.body.challengeId }, { $inc: { solveCount: 1 } });
        }

        logController.createLog(req, updatedUser, {
            state: "success",
        });

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