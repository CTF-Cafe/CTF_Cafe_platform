const express = require("express");
const router = express.Router();
const validation = require("../controllers/validationController");
const challengesController = require("../controllers/challengesController.js");
const teamController = require("../controllers/teamController.js");
const userController = require("../controllers/userController.js");
const ctfConfig = require("../models/ctfConfigModel.js");

router.post("/registerTeam", [validation.teamName()], (req, res) => {
  teamController.registerTeam(req, res);
});

router.get("/getTeamCount", (req, res) => {
  userController.getTeamCount(req, res);
});

router.post("/joinTeam", [validation.teamCode()], (req, res) => {
  teamController.joinTeam(req, res);
});

router.get("/leaveTeam", (req, res) => {
  teamController.leaveTeam(req, res);
});

router.post("/kickUser", [validation.username("userToKick")], (req, res) => {
  teamController.kickUser(req, res);
});

router.post(
  "/updateUsername",
  [validation.username("newUsername")],
  (req, res) => {
    userController.updateUsername(req, res);
  }
);

router.post(
  "/updatePassword",
  [validation.password("newPassword")],
  [validation.password("oldPassword")],
  (req, res) => {
    userController.updatePassword(req, res);
  }
);

router.post("/getTeamCode", [validation.teamName()], (req, res) => {
  teamController.getCode(req, res);
});

router.get("/getUserTeam", (req, res) => {
  teamController.getUserTeam(req, res);
});

router.post("/saveTeamCountry", [validation.emoji("country")], (req, res) => {
  teamController.saveTeamCountry(req, res);
});

router.post("/deployDocker", [validation.id("challengeId")], (req, res) => {
  challengesController.deployDocker(req, res);
});

router.post("/shutdownDocker", [validation.id("challengeId")], (req, res) => {
  challengesController.shutdownDocker(req, res);
});

router.post(
  "/submitFlag",
  [validation.id("challengeId"), validation.flag()],
  (req, res) => {
    challengesController.submitFlag(req, res);
  }
);

router.post("/buyHint", [validation.id("challengeId")], (req, res) => {
  challengesController.buyHint(req, res);
});

router.get("/getChallenges", (req, res) => {
  challengesController.getChallenges(req, res);
});

router.get("/getNotifications", async (req, res) => {
  const notifications = await ctfConfig.findOne({ name: "notifications" });

  if (notifications && notifications.value && notifications.value.length > 0) {
    const editedNotifications = notifications.value
      .map((notification) => {
        if (notification && notification.message && notification.seenBy) {
          if (!notification.seenBy.includes(req.session.userId)) {
            return {
              ...notification,
              seenBy: [...notification.seenBy, req.session.userId],
            };
          } else {
            return notification;
          }
        } else {
          return undefined;
        }
      })
      .filter((x) => x !== undefined);

    if (
      JSON.stringify(editedNotifications) !==
      JSON.stringify(notifications.value)
    ) {
      await ctfConfig.updateOne(
        { name: "notifications" },
        { $set: { value: editedNotifications } }
      );
    }

    const notificationsNeeded = notifications.value.filter(
      (notification) => !notification.seenBy.includes(req.session.userId)
    );

    res.send({ state: "success", notifications: notificationsNeeded });
  } else {
    res.send({ state: "error", notifications: [] });
  }
});

module.exports = router;
