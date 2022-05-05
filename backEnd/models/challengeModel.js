'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var challengeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        required: true
    },
    hints: {
        type: Array,
        default: [],
    },
    points: {
        type: Number,
        default: 100
    },
    info: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 0
    },
    solveCount: {
        type: Number,
        default: 0
    },
    file: {
        type: String,
        default: '',
    }
});

module.exports = mongoose.model('Challenges', challengeSchema);