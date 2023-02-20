"use strict";
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var logSchema = new Schema({
  authorIp: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  function: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("logs", logSchema);
