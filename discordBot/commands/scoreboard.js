const { MessageEmbed } = require('discord.js');
const users = require('./models/userModel');
const teams = require('./models/teamModel');

exports.run = async(bot, message, args) => {
    if (!args[0]) return message.reply('Please specify (users/teams) as the first argument.');

    if (args[0] === 'users') {
        const top = await users.find().sort({ score: -1, _id: 1 }).limit(24);

        const scoreboardEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('EZ CTF | Scoreboard')
            .setTimestamp()
            .setFooter({ text: 'Raxo#0468' });

        top.map((user, index) => scoreboardEmbed.addField(`${index + 1}. ${user.username}`, user.score.toString(), true))

        message.reply({ embeds: [scoreboardEmbed] });
    } else if (args[0] === 'teams') {
        const top = await teams.find().sort({ 'users.score': -1, _id: 1 }).limit(24);

        const scoreboardEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('EZ CTF | Scoreboard')
            .setTimestamp()
            .setFooter({ text: 'Raxo#0468' });

        top.map((team, index) => {
            team.users.forEach((user) => {
                if (team.totalScore) {
                    team.totalScore += user.score;
                } else {
                    team.totalScore = user.score;
                }
            });

            scoreboardEmbed.addField(`${index + 1}. ${team.name}`, team.totalScore.toString(), true);
        });

        message.reply({ embeds: [scoreboardEmbed] });
    } else {
        message.reply('Please specify (users/teams) as the first argument.');
    }
}

exports.info = {
    name: "scoreboard",
    description: "Get live scoreboard",
}