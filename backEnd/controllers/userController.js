const users = require('../models/userModel');
const crypto = require("crypto");
const { v4 } = require('uuid');
const ctfConfig = require('../models/ctfConfigModel.js');
const theme = require('../models/themeModel.js');
const teams = require('../models/teamModel.js');
const challenges = require('../models/challengeModel');

// Login anti bruteforce

const { RateLimiterRedis } = require('rate-limiter-flexible');
const redis = require('redis');
const redisClient = redis.createClient({
    enable_offline_queue: false,
});

const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByUsernameAndIP = 10;

const limiterSlowBruteByIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_consecutive_username_and_ip',
    points: maxConsecutiveFailsByUsernameAndIP,
    duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
    blockDuration: 60 * 60, // Block for 1 hour
});

const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

exports.login = async function(req, res) {
    const username = req.body.username.trim();
    const password = crypto.createHash('sha256').update(req.body.password.trim()).digest('hex');
    const ipAddr = req.ip;
    const usernameIPkey = getUsernameIPkey(username, ipAddr);

    const [resUsernameAndIP, resSlowByIP] = await Promise.all([
        limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
        limiterSlowBruteByIP.get(ipAddr),
    ]);

    let retrySecs = 0;

    // Check if IP or Username + IP is already blocked
    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
        retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
        retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
        res.set('Retry-After', String(retrySecs));
        res.send({ state: 'error', message: 'Too Many Requests' });
    } else {
        const user = await users.findOne({ username: username });

        if (user) {
            console.log(user);
            if (user.password === password) {
                const newKey = v4();

                req.session.username = username;
                req.session.key = newKey;
                await users.updateOne({ username: username }, { key: newKey.toString() });

                if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
                    // Reset on successful authorisation
                    await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
                }

                res.end({ state: 'success', message: 'Logged In', user: user });
            } else {
                // Consume 1 point from limiters on wrong attempt and block if limits reached
                try {
                    const promises = [limiterSlowBruteByIP.consume(ipAddr)];
                    if (user.exists) {
                        // Count failed attempts by Username + IP only for registered users
                        promises.push(limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey));
                    }

                    await Promise.all(promises);

                    res.send({ state: 'error', message: 'Wrong Credidentials' });

                } catch (rlRejected) {
                    if (rlRejected instanceof Error) {
                        throw rlRejected;
                    } else {
                        res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                        res.send({ state: 'error', message: 'Too Many Requests' });
                    }
                }
            }
        } else {
            res.send({ state: 'error', message: 'Wrong Credidentials' });
        }
    }
}

exports.logout = async function(req, res) {
    req.session.username = undefined;
    req.session.key = undefined;
    res.sendStatus(200);
}

exports.register = async function(req, res) {
    const username = req.body.username.trim();
    const password = crypto.createHash('sha256').update(req.body.password.trim()).digest('hex');
    const startTime = await ctfConfig.findOne({ name: 'startTime' });

    if (parseInt(startTime.value) - (Math.floor((new Date()).getTime() / 1000)) >= 0) {
        if (username.length >= 4) {
            if (username.length > 32) {
                res.send({ state: 'error', message: 'Username is to long!' });
            } else {
                const userExists = await users.findOne({ username: username });

                if (!userExists) {
                    const newKey = v4();

                    await users.create({ username: username, password: password, key: newKey.toString(), isAdmin: false }).then(async function(user) {

                        req.session.username = username;
                        req.session.key = newKey;
                        res.send({ state: 'success', message: 'Registered!', user: user });
                    }).catch(function(err) {
                        res.send({ state: 'error', message: 'User creation failed!' });
                    });
                } else {
                    res.send({ state: 'error', message: 'User name Exists!' });
                }
            }
        } else {
            res.send({ state: 'error', message: 'Username is to short! 4 Characters minimum!' });
        }
    } else {
        res.send({ state: 'error', message: 'Registrations are closed!' });
    }
}

exports.getUsers = async function(req, res) {
    let page = req.body.page;

    if (page <= 0) {
        res.send({ state: 'error', message: 'Page cannot be less than 1!' });
    } else {
        let userCount = await users.count();
        if (((page - 1) * 100) > userCount) {
            res.send({ state: 'error', message: 'No more pages!' });
        } else {
            if (isNaN(page)) {
                page = 1;
            }

            let allUsers = [];
            try {
                allUsers = await users.find({}).sort({ score: -1, _id: 1 }).skip((page - 1) * 100).limit(100);
            } catch (err) {
                allUsers = await users.find({}).sort({ score: -1, _id: 1 });
            }

            await allUsers.forEach(user => {
                user.password = 'Nice try XD';
                user.key = 'Nice try XD';
                user.isAdmin = false;
            });

            res.send(allUsers);
        }
    }

}

exports.getUser = async function(req, res) {
    let user = await users.findOne({ username: req.body.username });

    user.password = 'Nice try XD';
    user.key = 'Nice try XD';
    user.isAdmin = false;

    res.send(user);

}

exports.getEndTime = async function(req, res) {
    const endTime = await ctfConfig.findOne({ name: 'endTime' });

    res.send(endTime.value.toString());
}


exports.getRules = async function(req, res) {
    const rules = await ctfConfig.findOne({ name: 'rules' });

    res.send(rules.value);
}

exports.getTheme = async function(req, res) {
    const currentTheme = await theme.findOne({});

    if (currentTheme) {
        res.send({ state: 'success', theme: currentTheme });
    } else {
        res.send({ state: 'error', message: 'No Theme!' });
    }
}

exports.getScoreboard = async function(req, res) {
    let allTeams = await teams.find();

    allTeams.forEach((team) => {
        team.users.forEach((user) => {
            if (team.totalScore) {
                team.totalScore += user.score;
            } else {
                team.totalScore = user.score;
            }
        });
    });

    allTeams.sort((a, b) => {
        if (a.totalScore < b.totalScore) {
            return 1;
        }

        if (a.totalScore > b.totalScore) {
            return -1;
        }
    });

    let finalData = {
        standings: []
    }

    for (let i = 0; i < allTeams.length; i++) {
        if (allTeams[i].totalScore > 0) {
            finalData.standings.push({
                pos: i + 1,
                team: allTeams[i].name,
                score: allTeams[i].totalScore
            })
        }
    }

    res.send(finalData);
}

// {
//     "standings": [
//         { "pos": 1, "team": "Intergalactic Pwners", "score": 1700 },
//         { "pos": 2, "team": "h4ckmeifyouc4n", "score": 1200 },
//         { "pos": 3, "team": "MV Tech", "score": 100 }
//     ]
// }