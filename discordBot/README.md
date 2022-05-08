# Setup
## Prerequisites
- Discord.JS v13
- Node.JS
- If you want to use `?launch` to display the challenge list, make sure that you add your organizers' Discord IDs into the site's database

## Installation
- Set up a bot on https://discord.com/developers
- Make a `.env` file with the token in this format:
```
DISCORD_BOT_TOKEN = <insert the bot's token>
```
- Run `npm install` to install the requirements from `package.json`, then run `node ./bot.js` in the bot's directory