const mongoose = require("mongoose");
const db = mongoose.connection;
const dotenv = require("dotenv");
dotenv.config();

const users = require("../models/userModel.js");
const teams = require("../models/teamModel.js");
const challenges = require("../models/challengeModel.js");
const ObjectId = mongoose.Types.ObjectId;

mongoose.connect(process.env.MONGODB_CONNSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.once("open", async function () {
  console.log("Database Connected successfully");


  await challenges.updateMany({
    category: { $gt: '' }
  }, [
	{
	  $set: {
		tags: ["$category"]
	  }
	}
  ]);


  console.log("Done.");
});
