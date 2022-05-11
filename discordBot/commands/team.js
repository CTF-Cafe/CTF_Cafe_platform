const users = require('./models/userModel');
const teams = require('./models/teamModel');
const challenges = require('./models/challengeModel');
const { MessageEmbed } = require('discord.js');
const ObjectId = require('mongoose').Types.ObjectId;

exports.run = async(bot, message, args) => {
    if (!(message.guild === null)) return message.reply("This command only works in dms!");

    let checkUser = await users.findOne({ discordId: message.author.id });

    if (checkUser) {

        let userTeam;
        if (ObjectId.isValid(checkUser.teamId)) {
            userTeam = await teams.findById(checkUser.teamId);
        }

        if (userTeam) {

            const teamEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle(process.env.CTF_NAME + ` | ${userTeam.name} Team`)
                .setTimestamp()
                .setFooter({ text: 'powered by CTF Cafe' });

            userTeam.users.map((user, index) => {
                teamEmbed.addField(`${index + 1}. ${user.username}`, user.score.toString(), true);
            });

            message.reply({ embeds: [teamEmbed] });
        } else {
            message.reply("Not in a team!");
        }

    } else {
        message.reply("Your discord is not linked to any account!");
    }
}

exports.info = {
    name: "team",
    description: "See your current team! (Use in DMs)"
}