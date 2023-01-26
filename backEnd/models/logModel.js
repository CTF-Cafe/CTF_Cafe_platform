'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logSchema = new Schema({
    authorIp: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    function: {
        type: String,
        required: true
    },
    result: {
        type: mongoose.Mixed,
        required: true
    },
});

module.exports = mongoose.model('logs', logSchema);