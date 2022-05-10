const users = require('./models/userModel');
const { MessageEmbed } = require('discord.js');
const encryptionController = require('../controllers/encryptionController.js');

exports.run = async(bot, message, args) => {
    if (!(message.guild === null)) {
        message.reply("This command only works in dms!").then(() => {
            message.delete()
        });
        return
    }
    if (!args[0]) return message.reply('You must provide a username');
    if (!args[1]) return message.reply('You must provide a password');

    const username = args[0];
    const password = encryptionController.encrypt(args[1]);

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