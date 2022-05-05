const users = require('./models/userModel');
const teams = require('./models/teamModel');
const challenges = require('./models/challengeModel');
const { MessageEmbed } = require('discord.js');
const ObjectId = require('mongoose').Types.ObjectId;

exports.run = async(bot, message, args) => {
    if (!(message.guild === null)) return message.reply("This command only works in dms!");

    let checkUser = await users.findOne({ discordId: message.author.id });

    if (checkUser) {
        message.reply("Your score: " + checkUser.score + "\n\nChallenges Solved: \n" + checkUser.solved.map((s) => s.challenge.name + ' | '));
    } else {
        message.reply("Your discord is not linked to any account!");
    }
}

exports.info = {
    name: "score",
    description: "See your current score! (Use in DMs)"
}