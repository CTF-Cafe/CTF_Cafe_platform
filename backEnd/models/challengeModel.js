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
    hint: {
        type: String,
        required: true
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
    },
    codeSnippet: {
        type: String,
        default: ''
    },
    codeLanguage: {
        type: String,
        default: 'python'
    }
});

module.exports = mongoose.model('Challenges', challengeSchema);