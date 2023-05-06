// VERY IMPORTANT!! READ: https://www.troyhunt.com/we-didnt-encrypt-your-password-we-hashed-it-heres-what-that-means/

// const bcrypt = require('bcryptjs');

// exports.encrypt = async function(pass) {
//     return await bcrypt.hash(pass, 10);
// }

// exports.compare = async function(pass, hash) {
//     return await bcrypt.compare(pass, hash);
// }

function hashPassword(password) {
  return require("crypto").createHash("sha256").update(password, "utf8").digest("hex");
}

exports.encrypt = async function (pass) {
  return hashPassword(pass);
};

exports.compare = async function (pass, hash) {
  return hashPassword(pass) === hash;
};
