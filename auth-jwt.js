const jwt = require('jsonwebtoken')
const hpass = require('./hashpass')
const db = require('./db.js')

const inmemo_user2pass = {}

function timestamp_sec() {
  return Math.floor(new Date().getTime() / 1000)
}

function timestamp_nsec_later(n) {
  return timestamp_sec() + n
}

function timestamp_nday_later(n) {
  return timestamp_sec() + (n * 3600 * 24)
}

exports.login = async function(username, passwd) {
  username = username || ''
  passwd = passwd || ''

  try {
    const usr = await db.getUser(username)
    const hashpass = hpass.hashpass(username, passwd, usr.salt)

    if (hashpass === usr.hashpass) {
      const token = jwt.sign({
        exp: timestamp_nsec_later(10), /* debug */
        //exp: timestamp_nday_later(3), /* production */
        loggedInAs: username,
        scope: ['/*'],
      }, passwd, {algorithm: 'HS256'})

      inmemo_user2pass[username] = passwd
      await db.recordLogin(username, true)
      return [true, token]

    }

  } catch (err) {
    console.error(err.toString())
    await db.recordLogin(username, false)
    return [false, err.toString()]
  }

  await db.recordLogin(username, false)
  return [false, 'wrong password.']
}

exports.verify = async function(token) {
  token = token || ''

  try {
    const decTok = jwt.decode(token)
    const username = decTok['loggedInAs'] || '';
    const scope = decTok['scope'] || []
    const passwd = inmemo_user2pass[username] || '';

    jwt.verify(token, passwd)
    return [true, scope]

  } catch (err) {
    return [false, err.toString()]
  }
}

if (require.main === module) {
  (async function() {

    const loginRes = await exports.login('admin', 'changeme!')
    console.log(loginRes)

    const verifyRes = await exports.verify(loginRes[1])
    console.log(verifyRes)

    process.exit()
  })()
}
