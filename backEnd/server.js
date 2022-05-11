const express = require('express');
const app = express()
const port = process.env.PORT || 3001;
const mongoose = require('mongoose');
const db = mongoose.connection;
const dotenv = require('dotenv');
dotenv.config()
const bodyparser = require('body-parser');
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean/lib/xss').clean;
const setup = require('./setup.js');
const userRouter = require('./routes/userRoutes.js');
const adminRouter = require('./routes/adminRoutes.js');
const globalRouter = require('./routes/globalRoutes.js');
const users = require('./models/userModel.js');

mongoose.connect(process.env.MONGODB_CONNSTRING, { useNewUrlParser: true, useUnifiedTopology: true });

db.once("open", async function() {
    console.log("Database Connected successfully");
    setup.setupDB();
});

// Body-parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

var sess = {
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 * 2 // two weeks
    }
}

// Trust Proxy to be able to read X-Forwaded-For (user ips)
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

// Add headers before the routes are defined
app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URI);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Set-Cookie,X-Requested-With,content-type');

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

app.use('/api', globalRouter)
app.use('/api/user', checkAuth, userRouter)
app.use('/api/admin', checkAdminAuth, adminRouter)

app.use('/api/assets', express.static('assets'));

process.on('uncaughtException', function(err) {
    console.log('Uncaught exception: ' + err);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});