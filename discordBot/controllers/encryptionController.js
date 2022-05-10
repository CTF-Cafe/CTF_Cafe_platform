const bcrypt = require('bcryptjs');

exports.encrypt = async function(pass) {
    return await bcrypt.hash(pass, 10);
}

exports.compare = async function(pass, hash) {
    return await bcrypt.compare(pass, hash);
}