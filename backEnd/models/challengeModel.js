'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var challengeSchema = new Schema({
    hidden: {
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true
    },
    flag: {
        type: String,
        default: "FLAG{HELLO}"
    },
    hints: {
        type: Array,
        default: []
    },
    points: {
        type: Number,
        default: 100
    },
    firstBloodPoints: {
        type: Number,
        default: 0
    },
    initialPoints: {
        type: Number,
        default: 100
    },
    minimumPoints: {
        type: Number,
        default: 50
    },
    info: {
        type: String,
        default: "Beep. Boop."
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
        default: 'none'
    },
    firstBlood: {
        type: String,
        default: 'none'
    },
    githubUrl: {
        type: String,
        default: null
    },
    isInstance: {
        type: Boolean,
        default: false
    },
    randomFlag: {
        type: Boolean,
        default: false
    },
    randomFlags: {
        type: Array,
        default: []
    },
    requirement: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Challenges', challengeSchema);