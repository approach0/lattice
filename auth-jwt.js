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

exports.login = async function(username, passwd, debug) {
  username = username || ''
  passwd = passwd || ''
  console.log('[login]', username)

  let errmsg = 'wrong password.'
  try {
    const usr = await db.getUser(username)

    if (usr === undefined) {
      throw new Error(`No such user: '${username}'`)
    }

    const hashpass = hpass.hashpass(username, passwd, usr.salt)

    if (hashpass === usr.hashpass) {
      const epoch = epoch2secs()
      const later = debug ? seconds(10) : days2secs(3)
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

    } else {
      await db.recordLogin(username, false)
    }

  } catch (err) {
    console.error(err.toString())
    errmsg = err.toString()
  }

  return [false, errmsg]
}

exports.verify = async function(token) {
  token = token || ''
  console.log('[verify]', token)

  try {
    if (token === '') {
      throw new Error(`No token to be verified.`)
    }

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
