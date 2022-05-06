const { MessageEmbed } = require('discord.js');
const challenges = require('./models/challengeModel');

exports.run = async(bot, message, args) => {
    if (!message.member) return message.reply("You are not an admin!");
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply("You are not an admin!");

    const flagChallenge = await challenges.findOne({ name: 'Discord Bot Workaround' });

    if (flagChallenge) {
        message.reply("Here is your flag: " + flagChallenge.flag);
    } else {
        message.reply("Something is wrong contact an admin!");
    }
}

exports.info = {
    name: "flag",
    description: "Are you an admin?"
}