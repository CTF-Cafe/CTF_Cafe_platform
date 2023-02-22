'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const colorValidator = (v) => (/^#([0-9a-f]{3}){1,2}$/i).test(v)

var themeSchema = new Schema({
    color_1: {
        type: String,
        validator: [colorValidator, 'Invalid color'],
        default: '#ff3c5c'
    },
    color_2: {
        type: String,
        validator: [colorValidator, 'Invalid color'],
        default: '#ff707f'
    },
    bg_img: {
        type: String,
        default: 'none'
    },
    top1_icon: {
        type: String,
        default: 'none'
    },
    top2_icon: {
        type: String,
        default: 'none'
    },
    top3_icon: {
        type: String,
        default: 'none'
    }
});

module.exports = mongoose.model('Theme', themeSchema);