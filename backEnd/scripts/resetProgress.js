const mongoose = require('mongoose');
const db = mongoose.connection;
const dotenv = require('dotenv');
dotenv.config()

const users = require('../models/userModel.js');
const teams = require('../models/teamModel.js');
const challenges = require('../models/challengeModel.js');
const ObjectId = mongoose.Types.ObjectId;


mongoose.connect(process.env.MONGODB_CONNSTRING, { useNewUrlParser: true, useUnifiedTopology: true });

db.once("open", async function() {
    console.log("Database Connected successfully");

    await users.updateMany({
        "$size": { solved: { $gt: 0 } }
    }, { score: 0, solved: [] });

    console.log("Users reset successfully");

    await teams.updateMany({
        users: { $elemMatch: { score: { $gt: 0 } } }
    }, {
        $set: {
            "users.$.solved": [],
            "users.$.score": 0,
        }
    });

    console.log("Teams reset successfully");

    await challenges.updateMany({ solveCount: { $gt: 0 } }, { solveCount: 0, firstBlood: 'none' });

    console.log("Challenges reset successfully");

    console.log("Done.");

});