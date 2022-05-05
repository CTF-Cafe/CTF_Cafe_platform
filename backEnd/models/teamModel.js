'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
        required: true
            // validate: [teamLimit, '{PATH} exceeds the team limit of 4'],
    },

});

function teamLimit(val) {
    return val.length <= 4;
}

module.exports = mongoose.model('Teams', teamSchema);