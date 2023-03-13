const express = require("express");
const router = express.Router();
const challengesController = require("../controllers/challengesController.js");
const teamController = require("../controllers/teamController.js");
const userController = require("../controllers/userController.js");
const ctfConfig = require("../models/ctfConfigModel.js");
const users = require("../models/userModel.js");

router.post("/registerTeam", (req, res) => {
  teamController.register(req, res);
});

router.get("/getTeamCount", (req, res) => {
  userController.getTeamCount(req, res);
});

router.post("/joinTeam", (req, res) => {
  teamController.joinTeam(req, res);
});

router.get("/leaveTeam", (req, res) => {
  teamController.leaveTeam(req, res);
});

router.post("/kickUser", (req, res) => {
  teamController.kickUser(req, res);
});

router.post("/updateUsername", (req, res) => {
  userController.updateUsername(req, res);
});

router.post("/getTeamCode", (req, res) => {
  teamController.getCode(req, res);
});

router.post("/getUserTeam", (req, res) => {
  teamController.getUserTeam(req, res);
});

router.post('/deployDocker', (req, res) => {
    challengesController.deployDocker(req, res);
});

router.post('/shutdownDocker', (req, res) => {
    challengesController.shutdownDocker(req, res);
});

router.post('/launchDocker', (req, res) => {
    challengesController.launchDocker(req, res);
});

router.post("/stopDocker", (req, res) => {
  challengesController.stopDocker(req, res);
});

router.post("/submitFlag", (req, res) => {
  challengesController.submitFlag(req, res);
});

router.post("/buyHint", (req, res) => {
  challengesController.buyHint(req, res);
});

router.get("/getChallenges", (req, res) => {
  challengesController.getChallenges(req, res);
});

// MAKE MORE EFFICIENT
router.get("/getNotifications", async (req, res) => {
  const notifications = await ctfConfig.findOne({ name: "notifications" });
  let notificationsNeeded = [];

  if (notifications) {
    if (notifications.value) {
      if (notifications.value.length > 0) {
        editedNotifications = [...notifications.value];

        notifications.value.map(async (notification) => {
          if (!notification.seenBy.includes(req.session.username)) {
            editedNotifications[
              editedNotifications.findIndex((x) => x == notification)
            ].seenBy.push(req.session.username);
            notificationsNeeded.push(notification);
          }
        });

        if (
          JSON.stringify(editedNotifications) != JSON.stringify(notifications)
        ) {
          await ctfConfig.updateOne(
            { name: "notifications" },
            { $set: { value: editedNotifications } }
          );
        }
      }
    }
  }

  if (notificationsNeeded) {
    res.send({ state: "success", notifications: notificationsNeeded });
  } else {
    res.send({ state: "error", notifications: [] });
  }
});

module.exports = router;
