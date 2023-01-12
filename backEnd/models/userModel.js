'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    discordId: {
        type: String,
        default: 'none'
    },
    password: {
        type: String,
        required: true
    },
    solved: {
        type: Array,
        default: [],
    },
    score: {
        type: Number,
        default: 0
    },
    key: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    teamId: {
        type: String,
        default: 'none'
    },
    verified: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
    }
});

module.exports = mongoose.model('Users', userSchema);