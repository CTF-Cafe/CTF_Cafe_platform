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
    },
    firstBlood: {
        type: String,
        default: 'none'
    },
    dockerCompose: {
        type: String,
        default: ''
    },
    dockerLaunchers: {
        type: Array,
        default: []
    },
    randomFlag: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('Challenges', challengeSchema);