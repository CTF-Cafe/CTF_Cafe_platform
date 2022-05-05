const users = require('./models/userModel');
const { MessageEmbed } = require('discord.js');
const crypto = require("crypto");

exports.run = async(bot, message, args) => {
    if (!(message.guild === null)) {
        message.reply("This command only works in dms!");
        return message.delete();
    }
    if (!args[0]) return message.reply('You must provide a username');
    if (!args[1]) return message.reply('You must provide a password');

    const username = args[0];
    const password = crypto.createHash('sha256').update(args[1]).digest('hex');

    let userCheck = await users.findOne({ username: username, password: password });

    if (userCheck) {
        if (userCheck.discordId != 'none' || userCheck.discordId != undefined) {
            await users.findOneAndUpdate({ username: username, password: password }, { discordId: message.author.id });
            message.reply("Discord has been linked!");
        } else {
            message.reply("Account already linked!");
        }
    } else {
        message.reply("Wrong credentials!");
    }
}

exports.info = {
    name: "auth",
    description: "Authenticate your Discord with your CTF account. (Use in DM) \nUsage: ?auth username password"
}