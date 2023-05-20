const express = require("express");
const router = express.Router();
const validation = require("../controllers/validationController");
const userController = require("../controllers/userController.js");
const teamController = require("../controllers/teamController.js");
const users = require("../models/userModel.js");
const teams = require("../models/teamModel.js");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

router.get("/easteregg", async (req, res) => {
  res.send("Guacamole soon...");
});

router.post(
  "/login",
  [validation.username(), validation.password()],
  (req, res) => {
    userController.login(req, res);
  }
);

router.get("/logout", (req, res) => {
  userController.logout(req, res);
});

router.post(
  "/register",
  [
    validation.username(),
    validation.email(),
    validation.password(),
    validation.userCategory(),
  ],
  (req, res) => {
    userController.register(req, res);
  }
);

router.get("/verify/:id/:token", [validation.id()], async (req, res) => {
  userController.verifyMail(req, res);
});

router.post(
  "/getUsers",
  [validation.page(), validation.search()],
  (req, res) => {
    userController.getUsers(req, res);
  }
);

router.post("/getUser", [validation.username()], (req, res) => {
  userController.getUser(req, res);
});

router.post("/getTeam", [validation.teamName()], (req, res) => {
  teamController.getTeam(req, res);
});

router.post(
  "/getTeams",
  [validation.page()],
  [validation.search()],
  (req, res) => {
    teamController.getTeams(req, res);
  }
);

router.get("/getScoreboard", (req, res) => {
  userController.getScoreboard(req, res);
});

router.get("/getEndTime", (req, res) => {
  userController.getEndTime(req, res);
});

router.get("/getConfigs", (req, res) => {
  userController.getConfigs(req, res);
});

router.get("/checkSession", (req, res) => {
  users.findById(req.session.userId).then(async function (user) {
    if (!user) {
      res.send({ state: "sessionError" });
    } else if (!(user.key == req.session.key)) {
      res.send({ state: "sessionError" });
    } else {
      user.password = undefined;
      user.key = undefined;

      if (ObjectId.isValid(user.teamId)) {
        let team = await teams.findById(ObjectId(user.teamId));

        if (team) {
          team.inviteCode = undefined;
          res.send({ state: "success", user: user, team: team });
        } else {
          res.send({ state: "success", user: user });
        }
      } else {
        res.send({ state: "success", user: user });
      }
    }
  });
});

router.get("/getTheme", (req, res) => {
  userController.getTheme(req, res);
});

module.exports = router;
