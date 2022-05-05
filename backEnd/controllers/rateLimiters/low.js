const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoConn = require('../../server.js').db;

let maxPoints = 50;

const opts = {
    storeClient: mongoConn,
    keyPrefix: 'low_limit',
    points: maxPoints,
    duration: 60 * 60 * 3, // Store number for three hours since first fail
    blockDuration: 60 * 15, // Block for 15 minutes
};

const rateLimiterMongo = new RateLimiterMongo(opts);

exports.rateLimiter = rateLimiterMongo;
exports.maxPoints = maxPoints;