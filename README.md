Currently working on v2...
Updates : soon

[![StackShare](http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/ctfcafe/ctfcafe)

# Contributors

[@Zerotistic]( https://github.com/Zerotistic )
[@Eteckq]( https://github.com/Eteckq )


# Features

- Create your own challenges, files, hints, code snippets and flags from the admin dashboard
  - File uploads to the server
  - Flag submit bruteforce protection
  - Docker challenges
  - Dynamic flags for each team
  - Dynamic scoring possible with a decay of 15
- Individual and Team based competitions
  - Have users play on their own or form teams to play together
  - First blood's
  - Docker's launched by team
- Scoreboard with automatic tie resolution
  - See global user, team and challenge stats
  - See indivudal team & user stats
- Automatic competition starting and ending
  - Easily set endTime & startTime from the admin dashboard
- Team and user management ( promoting, banning, ect )
- Customize site colors, background, rules & frontpage
- Importing and Exporting of CTF scoreboards into json
- Email verification on registration
- And more...

# Manual Backend & Frontend Setup ( Dockers )

*docker compose setup is only usable if you wont run any dockerized challenges else use pm2*

# Manual Backend & Frontend Setup ( No Dockers )

## Prerequisites
- Node.JS
- MongoDB

## Setup
- copy `.env.example` to `.env` file in /backEnd/ and fill the info needed

- copy `.env.example` to `.env` file in /dockerAPI/ and fill the info needed

- copy `.env.example` to `.env` file in /frontEnd/ and fill the info needed

## Startup

`MongoDB`
- Start your mongoDB database
- If you're testing on Windows, you may need to download https://www.mongodb.com/try/download/community

`/frontEnd`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` or `npm run start-react` for easier dev to start the frontend

`/backEnd`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` to start & setup the backend

`/dockerAPI`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` to start & setup the backend

`/discordBot`
- This is optional, but can be used to setup a bot for the CTF. See here: https://github.com/CTF-Cafe/CTF_Cafe/tree/master/discordBot

*You can use `pm2` if you want an easy way to handle the nodejs processes.*

Make sure to create a new account, promote him to admin and delete the admin:admin user after setup!

Good to go!