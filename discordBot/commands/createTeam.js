const users = require('./models/userModel');
const teams = require('./models/teamModel');
const challenges = require('./models/challengeModel');
const { MessageEmbed } = require('discord.js');
const ObjectId = require('mongoose').Types.ObjectId;
const { v4 } = require('uuid');

exports.run = async(bot, message, args) => {
    if (!(message.guild === null)) return message.reply("This command only works in dms!");
    if (!args[0]) return message.reply('You must provide a team_name!');

    const teamName = args[0].trim();

    const teamCheck = await teams.findOne({ name: teamName });

    if (!teamCheck) {
        let checkUser = await users.findOne({ discordId: message.author.id });

        if (checkUser) {

            let userTeamCheck;
            if (ObjectId.isValid(checkUser.teamId)) {
                userTeamCheck = await teams.findById(checkUser.teamId);
            }

            if (!userTeamCheck) {
                const inviteCode = v4();
                await teams.create({ name: teamName, inviteCode: inviteCode, users: [{ username: checkUser.username, score: checkUser.score, solved: checkUser.solved }] }).then(async function(team) {
                    await users.findOneAndUpdate({ username: checkUser.username }, { teamId: team.id }, { returnOriginal: false }).then(async function(user) {
                        message.reply(`Registered team! Here is the invite code: ${inviteCode}`);
                    });
                }).catch(function(err) {
                    message.reply(`Team creation failed!`);
                });
            } else {
                message.reply(`Already in a team!`);
            }

        } else {
            message.reply("Your discord is not linked to any account!");
        }
    } else {
        message.reply("Team name already in use!");
    }
}

exports.info = {
    name: "createTeam",
    description: "Create a Team. (Use in DMs) \nUsage: ?createTeam team_name"
}