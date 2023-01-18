const logs = require("../models/logModel");

exports.createLog = async function (req, user, result) {

  await logs.create({
    authorIp: req.ip == "::ffff:127.0.0.1" ? req.socket.remoteAddress : req.ip,
    authorId: user._id,
    function: "login",
    result: result,
  });
};
