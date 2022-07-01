const express = require('express')
const router = express.Router()
const challengesController = require('../controllers/challengesController.js');
const teamController = require('../controllers/teamController.js');
const userController = require('../controllers/userController.js');
const ctfConfig = require('../models/ctfConfigModel.js');
const users = require('../models/userModel.js');

router.post('/registerTeam', (req, res) => {
    teamController.register(req, res);
});

router.post('/getTeamCount', (req, res) => {
    userController.getTeamCount(req, res);
});

router.post('/joinTeam', (req, res) => {
    teamController.joinTeam(req, res);
});

router.get('/leaveTeam', (req, res) => {
    teamController.leaveTeam(req, res);
});

router.post('/updateUsername', (req, res) => {
    userController.updateUsername(req, res);
});

router.post('/getTeamCode', (req, res) => {
    teamController.getCode(req, res);
});

router.post('/getUserTeam', (req, res) => {
    teamController.getUserTeam(req, res);
});


router.post('/submitFlag', (req, res) => {
    challengesController.submitFlag(req, res);
});

router.get('/getChallenges', (req, res) => {
    challengesController.getChallenges(req, res);
});

router.get('/getGlobalMessage', async(req, res) => {
    const globalMessage = await ctfConfig.findOne({ name: 'globalMessage' });
    let message;

    if (globalMessage) {
        if (globalMessage.value) {
            if (globalMessage.value.message && globalMessage.value.seenBy) {
                if (globalMessage.value.message.length > 0) {
                    if (!globalMessage.value.seenBy.includes(req.session.username)) {
                        await ctfConfig.updateOne({ name: 'globalMessage' }, { $push: { 'value.seenBy': req.session.username } });
                        message = globalMessage.value.message;
                    }
                }
            }
        }
    }

    if (message) {
        res.send({ state: 'success', message: message })
    } else {
        res.send({ state: 'error', message: 'No message!' })
    }
})

module.exports = router;