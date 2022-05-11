const challenges = require('./models/challengeModel');
const { MessageEmbed } = require('discord.js');
const users = require('./models/userModel');

exports.run = async(bot, message, args) => {
    if (!message.member) return message.reply("You are not an admin!");
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply("You are not an admin!");
    if (!args[0]) return message.reply('You must provide a channel id!');

    const allChallenges = await challenges.find();

    let checkUser = await users.findOne({ discordId: message.author.id });

    if (checkUser) {
        if (checkUser.isAdmin)
        /* checks the site's database to make sure the Discord user is
		an admin on the backend as well */
        {
            let scoreboardEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle(process.env.CTF_NAME + ' | Challenges')
                .setTimestamp()
                .setFooter({ text: 'powered by CTF Cafe' });


            for (let i = 0; i < allChallenges.length; i++) {
                const challenge = allChallenges[i];
                await scoreboardEmbed.addField(
                    `${challenge.name.trim()} | ${challenge.points} | ${challenge.level == 0 ? 'Easy' : challenge.level == 1 ? 'Medium' : challenge.level == 2 ? 'Hard' : 'Ninja'} | ${challenge.category}`,
                    "Info: \n```" + challenge.info.replace(/\\n/g, `\n`) + "```\nHints: \n" + challenge.hints.map((hint, index) => `|| ${hint} ||`) + (challenge.file.length > 0 ? `\n\nFile below:` : ''))

                if (challenge.file.length > 0) {
                    await message.guild.channels.cache.get(args[0]).send({ embeds: [scoreboardEmbed] }).then(async() => {
                        await message.guild.channels.cache.get(args[0]).send({
                            files: ['./assets/' + challenge.file]
                        })
                    });

                    scoreboardEmbed = new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle(process.env.CTF_NAME + ' | Challenges')
                        .setTimestamp()
                        .setFooter({ text: 'powered by CTF Cafe' });
                }
            }

            message.guild.channels.cache.get(args[0]).send({ embeds: [scoreboardEmbed] });
        } else {
            message.reply('Not an admin!');
        }
    } else {
        message.reply('Discord is not linked to any account!');
    }
}

exports.info = {
    name: "launch",
    description: "Very Secret, only for Admins"
}