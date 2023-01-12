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
- Make a `.env` file in /backEnd/ in this format:
```
SESSION_SECRET=<secure randomly generated session key for validating session cookies>
MONGODB_CONNSTRING=<mongodb connect URI, e.g. "mongodb://localhost:27017" - you may need to surround it in quotes if you experience glitches or formatting issues>
NODE_ENV=<development/production>
FRONTEND_URI=<frontend url if local usually http://localhost:3000>
BACKEND_URI=<backend url same as frontend unless testing locally, will then be port 3001>

HOST=<mail server>
MAIL_PORT=<mail server port>
MAIL=<mail address to send emails>
PASS=<mail password to send emails>
```

- Make a `.env` file in /frontEnd/ in this format:
```
REACT_APP_SERVER_URI=<your backend url that has the /api pages and functions, e.g. http://localhost:3001>
REACT_APP_CTF_NAME=<ctf_name_formatted_like_this>
GENERATE_SOURCEMAP=<true for dev | false for production>
```

## Startup

`MongoDB`
- Start your mongoDB database
- If you're testing on Windows, you may need to download https://www.mongodb.com/try/download/community

`/frontEnd`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` or `npm run start-react` for easier dev to start the frontend

`/backEnd`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` to start & setup the backend

`/discordBot`
- This is optional, but can be used to setup a bot for the CTF. See here: https://github.com/CTF-Cafe/CTF_Cafe/tree/master/discordBot

*You can use `pm2` if you want an easy way to handle the nodejs processes.*

Make sure to create a new account, promote him to admin and delete the admin:admin user after setup!

Good to go!
