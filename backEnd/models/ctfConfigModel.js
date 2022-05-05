'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var configSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: mongoose.Mixed,
        required: true
    }
});

module.exports = mongoose.model('ctfConfigs', configSchema);