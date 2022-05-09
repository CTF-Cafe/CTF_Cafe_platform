# Frontend & Backendup Setup
## Prerequisites
- Node.JS
- MongoDB
- VsCode

## Setup
- Make a `.env` file on /backEnd/ in this format:
```
SECRET_KEY=<session key>
MONGODB_CONNSTRING=<mongodb connect url>
```

- Make a `.env` file on /frontEnd/ in this format:
```
REACT_APP_SERVER_URI=<your backend url>
REACT_APP_CTF_NAME=<ctf_name>
GENERATE_SOURCEMAP=<true for dev | false for production>
```

## Startup

`/frontEnd`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` or `npm run start-react` for easier dev to start the frontend

`/backEnd`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` to start & setup the backend

Good to go!