const jwt = require('jsonwebtoken')
const hpass = require('./hashpass')
const db = require('./db.js')

const inmemo_user2pass = {}

function epoch2secs() {
  return Math.floor(new Date().getTime() / 1000)
}

function seconds(n) {
  return n
}

function days2secs(n) {
  return n * 3600 * 24
}

exports.login = async function(username, passwd) {
  username = username || ''
  passwd = passwd || ''

  try {
    const usr = await db.getUser(username)

    if (usr === undefined) {
      throw new Error(`No such user: '${username}'`)
    }

    const hashpass = hpass.hashpass(username, passwd, usr.salt)

    if (hashpass === usr.hashpass) {
      const epoch = epoch2secs()
      const later = seconds(10) /* debug */
      //const later = days2secs(3) /* production */
      const info = {
        exp: epoch + later,
        maxAge: later,
        loggedInAs: username,
        scope: ['/*']
      }
      const algorithm = {algorithm: 'HS256'}
      const token = jwt.sign(info, passwd, algorithm)

      inmemo_user2pass[username] = passwd
      await db.recordLogin(username, true)
      return [true, {info, algorithm, token}]
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
    const passwd = inmemo_user2pass[username];

    if (passwd === undefined) {
      throw new Error(`No such user: '${username}'`)
    }

    jwt.verify(token, passwd)
    return [true, decTok]

  } catch (err) {
    return [false, err.toString()]
  }
}

if (require.main === module) {
  (async function() {

    const loginRes = await exports.login('admin', 'changeme!')
    console.log(loginRes)

    const verifyRes = await exports.verify(loginRes[1]['token'])
    console.log(verifyRes)

    process.exit()
  })()
}
