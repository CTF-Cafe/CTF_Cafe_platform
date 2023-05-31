'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dockerSchema = new Schema({
    dockerId: {
        type: String,
        required: true
    },
    challengeId: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },
    mappedPort: {
        type: Number,
        required: true,
    },
    deployTime: {
        type: String,
        default: new Date().getTime()
    },
    githubUrl: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    randomFlag: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('dockers', dockerSchema);