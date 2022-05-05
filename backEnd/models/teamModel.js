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
        bsonType: ["array"],
        items: {
            bsonType: ["object"]
        },
        minItems: 0,
        maxItems: 4,
        description: "must be a array of objects and max is 4"
    },

});

function teamLimit(val) {
    return val.length <= 4;
}

module.exports = mongoose.model('Teams', teamSchema);