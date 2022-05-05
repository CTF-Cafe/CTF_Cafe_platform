const users = require('./models/userModel');
const teams = require('./models/teamModel');
const challenges = require('./models/challengeModel');
const { MessageEmbed } = require('discord.js');
const ObjectId = require('mongoose').Types.ObjectId;
const { v4 } = require('uuid');

exports.run = async(bot, message, args) => {
    if (!(message.guild === null)) return message.reply("This command only works in dms!");
    if (!args[0]) return message.reply('You must provide an invite code!');

    const inviteCode = args[0].trim();

    const teamCheck = await teams.findOne({ inviteCode: inviteCode });

    if (teamCheck) {
        let checkUser = await users.findOne({ discordId: message.author.id });

        if (checkUser) {

            let userTeamCheck;
            if (ObjectId.isValid(checkUser.teamId)) {
                userTeamCheck = await teams.findById(checkUser.teamId);
            }

            if (!userTeamCheck) {
                if (teamCheck.users.length < 4) {
                    await teams.findOneAndUpdate({ inviteCode: inviteCode }, { $push: { users: { username: checkUser.username, score: checkUser.score, solved: checkUser.solved } } }, { returnOriginal: false }).then(async function(team) {
                        await users.findOneAndUpdate({ username: checkUser.username }, { teamId: team.id }, { returnOriginal: false }).then(async function(user) {
                            res.send({ state: 'success', message: 'Joined team!', user: user, team: team });
                        });
                    }).catch(error => {
                        res.send({ state: 'error', message: error.messsage });
                    });
                } else {
                    res.send({ state: 'error', message: 'Team is full!' });
                }
            } else {
                message.reply(`Already in a team!`);
            }

        } else {
            message.reply("Your discord is not linked to any account!");
        }
    } else {
        message.reply("Team does not exist!");
    }
}

exports.info = {
    name: "joinTeam",
    description: "Join a Team. (Use in DMs) \nUsage: ?joinTeam invite_code"
}