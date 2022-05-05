const { MessageEmbed } = require('discord.js');
const users = require('./models/userModel');

exports.run = async(bot, message, args) => {
    const top = await users.find().sort({ score: -1, _id: 1 }).limit(24);

    const scoreboardEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('EZ CTF | Scoreboard')
        .setTimestamp()
        .setFooter({ text: 'Raxo#0468' });

    top.map((user, index) => scoreboardEmbed.addField(`${index + 1}. ${user.username}`, user.score.toString(), true))

    message.reply({ embeds: [scoreboardEmbed] });
}

exports.info = {
    name: "scoreboard",
    description: "Get live scoreboard",
}