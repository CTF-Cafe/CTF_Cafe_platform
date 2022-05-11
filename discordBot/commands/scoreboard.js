const { MessageEmbed } = require('discord.js');
const users = require('./models/userModel');
const teams = require('./models/teamModel');

function max(input) {
    if (toString.call(input) !== "[object Array]")
        return false;
    return Math.max.apply(null, input);
}

exports.run = async(bot, message, args) => {
    if (!args[0]) return message.reply('Please specify (users/teams) as the first argument.');

    if (args[0] === 'users') {
        const top = await users.find().sort({ score: -1, _id: 1 }).limit(24);

        const scoreboardEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle(process.env.CTF_NAME + ' | Scoreboard')
            .setTimestamp()
            .setFooter({ text: 'powered by CTF Cafe' });

        top.map((user, index) => scoreboardEmbed.addField(`${index + 1}. ${user.username}`, user.score.toString(), true))

        message.reply({ embeds: [scoreboardEmbed] });
    } else if (args[0] === 'teams') {
        const top = await teams.aggregate([{
            "$project": {
                "name": 1,
                "users": 1,
                "totalScore": {
                    "$sum": "$users.score"
                },
                "timestamps": "$users.solved.timestamp"
            }
        }, {
            '$sort': {
                'totalScore': -1
            }
        }]).limit(24);

        top.forEach(team => {
            let maxTimestamp = 0;

            team.timestamps.forEach(timestamp => {
                if (max(timestamp) > maxTimestamp) {
                    maxTimestamp = max(timestamp)
                }
            });

            team.maxTimestamp = maxTimestamp;
        })

        top.sort((a, b) => {
            if (b.totalScore - a.totalScore == 0) {
                return a.maxTimestamp - b.maxTimestamp;
            } else {
                return b.totalScore - a.totalScore;
            }
        });

        const scoreboardEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle(process.env.CTF_NAME + ' | Scoreboard')
            .setTimestamp()
            .setFooter({ text: 'powered by CTF Cafe' });

        top.map((team, index) => {
            scoreboardEmbed.addField(`${index + 1}. ${team.name}`, team.totalScore.toString(), true);
        });

        message.reply({ embeds: [scoreboardEmbed] });
    } else {
        message.reply('Please specify (users/teams) as the first argument.');
    }
}

exports.info = {
    name: "scoreboard",
    description: "Get live scoreboard. \nUsage: ?scoreboard users|teams",
}