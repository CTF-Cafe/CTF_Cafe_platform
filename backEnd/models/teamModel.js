'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

function teamLimit(val) {
    return val.length <= 4;
}

var teamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    inviteCode: {
        type: String,
        required: true
    },
    users: {
        type: Array,
        validate: [teamLimit, '{PATH} exceeds the limit of 4'],
        required: true,
    },
    teamCaptain: {
        type: String,
        required: false,
    }

});

module.exports = mongoose.model('Teams', teamSchema);