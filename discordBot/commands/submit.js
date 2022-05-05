const users = require('./models/userModel');
const teams = require('./models/teamModel');
const challenges = require('./models/challengeModel');
const { MessageEmbed } = require('discord.js');
const ObjectId = require('mongoose').Types.ObjectId;

exports.run = async(bot, message, args) => {
    if (!(message.guild === null)) {
        message.reply("This command only works in dms!").then(() => {
            message.delete()
        });
        return
    }
    if (!args[0]) return message.reply('You must provide a challenge name (replace spaces with _)');
    if (!args[1]) return message.reply('You must provide a flag');

    const challengeName = args[0].replace('_', ' ').trim();
    const challengeFlag = args[1].trim();

    const challengeCheck = await challenges.findOne({ name: challengeName });

    let allChallenges = await challenges.find({});


    if (challengeCheck) {
        if (challengeCheck.flag == challengeFlag) {
            let checkUser = await users.findOne({ discordId: message.author.id });

            if (checkUser) {
                if (checkUser.solved.filter(obj => { return obj.challenge._id.equals(challengeCheck._id) }).length > 0) {
                    message.reply(`Already solved!`);
                } else {
                    if (ObjectId.isValid(checkUser.teamId)) {
                        const team = await teams.findById(checkUser.teamId);

                        if (team) {
                            if (team.users.filter(user => {
                                    return (user.solved.filter(obj => {
                                        return obj.challenge._id.equals(challengeCheck._id)
                                    }).length > 0)
                                }).length > 0) {
                                message.reply(`Already solved!`);
                            } else {
                                let timestamp = new Date().getTime();
                                challengeCheck.flag = 'Nice try XD';

                                await users.updateOne({ discordId: message.author.id }, { $push: { solved: { _id: challengeCheck._id, challenge: challengeCheck, timestamp: timestamp } } });
                                await users.updateOne({ discordId: message.author.id }, { $inc: { score: challengeCheck.points } });

                                const updatedUser = await users.findOne({ discordId: message.author.id });

                                await teams.updateOne({
                                    _id: team._id,
                                    users: { $elemMatch: { username: updatedUser.username } }
                                }, {
                                    $set: {
                                        "users.$.solved": updatedUser.solved,
                                        "users.$.score": updatedUser.score,
                                    }
                                });

                                await challenges.updateOne({ _id: challengeCheck.id }, { $inc: { solveCount: 1 } });

                                message.reply(`Correct flag, +${challengeCheck.points} points!`);
                            }
                        } else {
                            message.reply(`Not in a team!`);
                        }
                    } else {
                        message.reply(`Not in a team!`);
                    }
                }

            } else {
                message.reply("Your discord is not linked to any account!");
            }

        } else {
            message.reply("Wrong flag!");
        }
    } else {
        message.reply("Challenge does not exist!");
    }
}

exports.info = {
    name: "submit",
    description: "Submit a challenge Flag. (Use in DMs) \nUsage: ?submit challenge_name flag"
}