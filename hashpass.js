const crypto = require('crypto')

function hash256(content) {
  return crypto.createHmac("sha256", content).digest("hex")
}

exports.hashpass = function(user, passwd, salt) {
  return hash256(passwd + salt + user)
}

exports.salt48 = function() {
  return crypto.randomBytes(6).toString("hex")
}
