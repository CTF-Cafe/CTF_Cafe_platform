/*
ROUTE : GET /user/hidden/secret
FUNCTION : TEST SUB ROUTES
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
  res.message = "SECRET";
  return [req, res];
};
