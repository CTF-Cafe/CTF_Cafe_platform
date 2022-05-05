const { getPost, getImage } = require('random-reddit')

exports.run = async(bot, message, args) => {
    const image = await getImage('memes')
    message.channel.send(image);
}

exports.info = {
    name: "meme",
    description: "Random Meme"
}