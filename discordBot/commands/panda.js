const { getPost, getImage } = require('random-reddit')

exports.run = async(bot, message, args) => {
    const image = await getImage('panda')
    message.channel.send(image);
}

exports.info = {
    name: "panda",
    description: "Random Panda"
}