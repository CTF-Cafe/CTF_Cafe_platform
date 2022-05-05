exports.run = async(bot, message, args) => {
    let commandsArray = Array.from(bot.commands.values());
    let msg = 'Commands: \n';
    for (let i = 0; i < commandsArray.length; i++) {
        msg += '```' + commandsArray[i].info.name + ' - ' + commandsArray[i].info.description + '```\n';
    }

    message.channel.send(msg);
}

exports.info = {
    name: "help",
    description: "Help Command",
}