/*
ROUTE : /user/pluginTest
FUNCTION : TEST PLUGINS
AUTHOR : Raxo
*/

exports.method = "POST"

exports.verify = function (req, res) {
  if (!req.body.egg) throw new Error("no egg provided!");
  return [req, res];
};

exports.manipulate = function (req, res) {
  req.body.egg += " MIAM MIAM";
  return [req, res];
};

exports.respond = function (req, res) {
  res.message = req.body.egg;
  return [req, res];
};
