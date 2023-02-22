const express = require('express');
const router = express.Router();
const dockerController = require("../controllers/dockerController");

router.post('/deployDocker', (req, res) => {
    dockerController.deployDocker(req, res);
});

router.post('/shutdownDocker', (req, res) => {
    dockerController.shutdownDocker(req, res);
});

router.post('/getDockers', (req, res) => {
    dockerController.getDockers(req, res);
});

router.post('/getAllDockers', (req, res) => {
    dockerController.getAllDockers(req, res);
});

module.exports = router;