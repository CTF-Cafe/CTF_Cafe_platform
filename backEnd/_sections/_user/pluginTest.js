/*
ROUTE : /user/pluginTest
FUNCTION : TEST PLUGINS
AUTHOR : Raxo
*/

exports.method = "POST"

exports.verify = function (req, res) {
  if (!req.body.flag) throw new Error("no flag provided!");
  return [req, res];
};

exports.manipulate = function (req, res) {
  req.body.flag += "HELO BELO";
  return [req, res];
};

exports.respond = function (req, res) {
  res.message = req.body.flag;
  return [req, res];
};
