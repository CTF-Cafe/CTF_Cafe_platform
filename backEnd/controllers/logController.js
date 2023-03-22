const callerId = require('caller-id');
const logs = require("../models/logModel");

exports.createLog = async function (req, user, result) {
  const caller = callerId.getData();
  await logs.create({
    authorIp: req.ip == "::ffff:127.0.0.1" ? req.socket.remoteAddress : req.ip,
    authorId: user._id,
    authorName: user.username,
    function: caller.functionName,
    result: JSON.stringify(result),
  });
};
