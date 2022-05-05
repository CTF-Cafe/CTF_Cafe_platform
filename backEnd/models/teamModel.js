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
        required: true,
        maxItems: 4,
        description: 'Team is full!'
    },

});

function teamLimit(val) {
    return val.length <= 4;
}

module.exports = mongoose.model('Teams', teamSchema);