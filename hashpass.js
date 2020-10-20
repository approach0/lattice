const crypto = require('crypto')

function hash256(content) {
  return crypto.createHmac("sha256", content).digest("hex")
}

exports.hashpass = function(user, passwd, salt) {
  return hash256(passwd + salt + user)
}

exports.randomHex = function(nBytes) {
  return crypto.randomBytes(nBytes).toString("hex")
}

if (require.main === module) {
  console.log(exports.randomHex(2048))
}
