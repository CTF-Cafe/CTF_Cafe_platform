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
                team = await teams.findById(user.teamId);

                if (team) {
                    team.inviteCode = 'Nice try XD';

                    res.send({ state: 'success', user: user, team: team });
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