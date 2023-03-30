const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController.js');

router.post('/getLogs', (req, res) => {
    adminController.getLogs(req, res);
});

router.post('/getUsers', (req, res) => {
    adminController.getUsers(req, res);
});

router.post('/getTeams', (req, res) => {
    adminController.getTeams(req, res);
});

router.post('/deleteUser', (req, res) => {
    adminController.deleteUser(req, res);
});

router.post('/deleteTeam', (req, res) => {
    adminController.deleteTeam(req, res);
});

router.post('/addAdmin', (req, res) => {
    adminController.addAdmin(req, res);
});

router.post('/removeAdmin', (req, res) => {
    adminController.removeAdmin(req, res);
});

router.post('/shadowBan', (req, res) => {
    adminController.shadowBan(req, res);
});

router.post('/unShadowBan', (req, res) => {
    adminController.unShadowBan(req, res);
});

router.post('/setUserAdminPoints', (req, res) => {
    adminController.setUserAdminPoints(req, res);
});

router.post('/changeUserPassword', (req, res) => {
    adminController.changeUserPassword(req, res);
});

router.post('/getStats', (req, res) => {
    adminController.getStats(req, res);
});

router.get('/getAssets', (req, res) => {
    adminController.getAssets(req, res);
});

router.post('/saveConfigs', (req, res) => {
    adminController.saveConfigs(req, res);
});

router.post('/deleteAsset', (req, res) => {
    adminController.deleteAsset(req, res);
});

router.post('/uploadAsset', (req, res) => {
    adminController.uploadAsset(req, res);
});

router.post('/saveChallenge', (req, res) => {
    adminController.saveChallenge(req, res);
});

router.post('/createChallenge', (req, res) => {
    adminController.createChallenge(req, res);
});

router.post('/updateChallengeCategory', (req, res) => {
    adminController.updateChallengeCategory(req, res);
});

router.post('/deleteChallenge', (req, res) => {
    adminController.deleteChallenge(req, res);
});

router.post('/saveTheme', (req, res) => {
    adminController.saveTheme(req, res);
});

router.post('/sendGlobalMessage', (req, res) => {
    adminController.sendGlobalMessage(req, res);
});

router.post('/getDockers', (req, res) => {
    adminController.getDockers(req, res);
});

router.post('/shutdownDocker', (req, res) => {
    adminController.shutdownDocker(req, res);
});

router.post('/restartDocker', (req, res) => {
    adminController.restartDocker(req, res);
});

module.exports = router;