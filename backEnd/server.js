const express = require('express');
const app = express()
const port = process.env.PORT || 3001;
const mongoose = require('mongoose');
const db = mongoose.connection;
const dotenv = require('dotenv');
const bodyparser = require('body-parser');
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean/lib/xss').clean
const rateLimit = require('express-rate-limit');
dotenv.config()

const setup = require('./setup.js');
const userController = require('./controllers/userController.js');
const challengesController = require('./controllers/challengesController.js');
const adminController = require('./controllers/adminController.js');
const teamController = require('./controllers/teamController.js');
const users = require('./models/userModel.js');
const teams = require('./models/teamModel.js');
const ctfConfig = require('./models/ctfConfigModel.js');
const ObjectId = mongoose.Types.ObjectId;

mongoose.connect(process.env.MONGODB_CONNSTRING, { useNewUrlParser: true, useUnifiedTopology: true });

db.once("open", async function() {
    console.log("Database Connected successfully");
    setup.setupDB();
});

// Body-parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(session({
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 * 2 // two weeks
    }
}));

// Add headers before the routes are defined
app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(fileUpload({
    createParentPath: true
}));

function customSanitize(req, res, next) {

    Object.entries(req.body).forEach(([key, value]) => {
        req.body[key] = mongoSanitize.sanitize(xssClean(value));
    });

    Object.entries(req.query).forEach(([key, value]) => {
        req.query[key] = mongoSanitize.sanitize(xssClean(value));
    });

    Object.entries(req.params).forEach(([key, value]) => {
        req.params[key] = mongoSanitize.sanitize(xssClean(value));
    });

    next();
}

app.use(customSanitize);

function checkAuth(req, res, next) {

    users.findOne({ username: req.session.username }).then(function(user) {
        if (!user) {
            res.send({ state: 'sessionError' })
        } else if (!(user.key == req.session.key)) {
            res.send({ state: 'sessionError' })
        } else {
            next();
        }
    });
}

function checkAdminAuth(req, res, next) {

    users.findOne({ username: req.session.username }).then(function(user) {
        if (!user) {
            res.send({ state: 'sessionError' })
        } else if (!(user.key == req.session.key)) {
            res.send({ state: 'sessionError' })
        } else if (!user.isAdmin) {
            res.send({ state: 'sessionError' })
        } else {
            next();
        }
    });
}

const apiLimiterLow = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    message: { state: 'error', message: 'Rate limit exceeded, wait a couple minutes.' },
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const apiLimiterHigh = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 25, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { state: 'error', message: 'Rate limit exceeded, wait a couple minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.post('/api/login', apiLimiterHigh, (req, res) => {
    userController.login(req, res);
});

app.get('/api/logout', (req, res) => {
    userController.logout(req, res);
});

app.post('/api/register', apiLimiterHigh, (req, res) => {
    userController.register(req, res);
});

app.post('/api/checkSession', (req, res) => {
    users.findOne({ username: req.session.username }).then(async function(user) {
        if (!user) {
            res.send({ state: 'sessionError' })
        } else if (!(user.key == req.session.key)) {
            res.send({ state: 'sessionError' })
        } else {

            if (ObjectId.isValid(user.teamId)) {
                team = await teams.findById(user.teamId);

                if (team) {
                    team.inviteCode = 'Nice try XD';

                    res.send({ state: 'success', user: user, team: team });
                } else {
                    res.send({ state: 'success', user: user })
                }
            } else {
                res.send({ state: 'success', user: user })
            }
        }
    });
});


app.post('/api/registerTeam', checkAuth, (req, res) => {
    teamController.register(req, res);
});

app.post('/api/joinTeam', checkAuth, (req, res) => {
    teamController.joinTeam(req, res);
});

app.get('/api/leaveTeam', checkAuth, (req, res) => {
    teamController.leaveTeam(req, res);
});

app.post('/api/getTeamCode', checkAuth, (req, res) => {
    teamController.getCode(req, res);
});

app.post('/api/getUserTeam', checkAuth, (req, res) => {
    teamController.getUserTeam(req, res);
});


app.post('/api/submitFlag', apiLimiterLow, checkAuth, (req, res) => {
    challengesController.submitFlag(req, res);
});

app.get('/api/getChallenges', checkAuth, (req, res) => {
    challengesController.getChallenges(req, res);
});

app.post('/api/getUsers', (req, res) => {
    userController.getUsers(req, res);
});

app.post('/api/getUser', (req, res) => {
    userController.getUser(req, res);
});


app.post('/api/getTeams', (req, res) => {
    teamController.getTeams(req, res);
});

app.get('/api/getScoreboard', (req, res) => {
    userController.getScoreboard(req, res);
});

app.get('/api/getEndTime', (req, res) => {
    userController.getEndTime(req, res);
});

app.get('/api/getRules', (req, res) => {
    userController.getRules(req, res);
});

app.get('/api/getGlobalMessage', (req, res) => {
    const globalMessage = await ctfConfig.findOne({ name: 'globalMessage' });
    let message;

    if (globalMessage) {
        if (globalMessage.value) {
            if (globalMessage.value.message && globalMessage.value.seenBy) {
                if (globalMessage.value.message.length > 0) {
                    if (!globalMessage.value.seenBy.includes(req.session.username)) {
                        await ctfConfig.updateOne({ name: 'globalMessage' }, { $push: { seenBy: req.session.username } });
                        message = globalMessage.value.message;
                    }
                }
            }
        }
    }

    if (message) {
        res.send({ state: 'success', message: message })
    } else {
        res.send({ state: 'error', message: 'No message!' })
    }
})

app.get('/api/getTheme', (req, res) => {
    userController.getTheme(req, res);
});

app.post('/api/admin/getUsers', checkAdminAuth, (req, res) => {
    adminController.getUsers(req, res);
});

app.post('/api/admin/deleteUser', checkAdminAuth, (req, res) => {
    adminController.deleteUser(req, res);
});

app.post('/api/admin/deleteTeam', checkAdminAuth, (req, res) => {
    adminController.deleteTeam(req, res);
});

app.post('/api/admin/addAdmin', checkAdminAuth, (req, res) => {
    adminController.addAdmin(req, res);
});

app.post('/api/admin/removeAdmin', checkAdminAuth, (req, res) => {
    adminController.removeAdmin(req, res);
});

app.post('/api/admin/getStats', checkAdminAuth, (req, res) => {
    adminController.getStats(req, res);
});

app.get('/api/admin/getAssets', checkAdminAuth, (req, res) => {
    adminController.getAssets(req, res);
});

app.get('/api/admin/getConfigs', checkAdminAuth, (req, res) => {
    adminController.getConfigs(req, res);
});

app.post('/api/admin/saveConfigs', checkAdminAuth, (req, res) => {
    adminController.saveConfigs(req, res);
});

app.post('/api/admin/deleteAsset', checkAdminAuth, (req, res) => {
    adminController.deleteAsset(req, res);
});

app.post('/api/admin/uploadAsset', checkAdminAuth, (req, res) => {
    adminController.uploadAsset(req, res);
});

app.post('/api/admin/saveChallenge', checkAdminAuth, (req, res) => {
    adminController.saveChallenge(req, res);
});

app.post('/api/admin/createChallenge', checkAdminAuth, (req, res) => {
    adminController.createChallenge(req, res);
});

app.post('/api/admin/updateChallengeCategory', checkAdminAuth, (req, res) => {
    adminController.updateChallengeCategory(req, res);
});

app.post('/api/admin/deleteChallenge', checkAdminAuth, (req, res) => {
    adminController.deleteChallenge(req, res);
});

app.post('/api/admin/saveTheme', checkAdminAuth, (req, res) => {
    adminController.saveTheme(req, res);
});

app.post('/api/admin/sendGlobalMessage', checkAdminAuth, (req, res) => {
    adminController.sendGlobalMessage(req, res);
});

app.use('/api/assets', express.static('assets'));

process.on('uncaughtException', function(err) {
    console.log('Uncaught exception: ' + err);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});