/*
ROUTE : /user/pluginTest
FUNCTION : TEST PLUGINS
AUTHOR : Raxo
*/

exports.method = "GET"

exports.verify = function (req, res) {
  return [req, res];
};

exports.manipulate = function (req, res) {
  return [req, res];
};

exports.respond = function (req, res) {
  res.message = "EGG";
  return [req, res];
};
