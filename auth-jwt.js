const jwt = require('jsonwebtoken')
const hpass = require('./hashpass')
const db = require('./db.js')

/* for security, jwt_secret is suggested to be greater than 256 bytes */
const jwt_secret = hpass.randomHex(2048)

function epoch2secs() {
  return Math.floor(new Date().getTime() / 1000)
}

function seconds(n) {
  return n
}

function days2secs(n) {
  return n * 3600 * 24
}

exports.getJWTSecret = function() {
  return jwt_secret
}

exports.login = async function(username, passwd, debug) {
  username = username || ''
  passwd = passwd || ''
  console.log('[login user]', username)

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
      const token = jwt.sign(info, jwt_secret, algorithm)

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

exports.verify = async function(token, secret) {
  token = token || ''
  secret = secret || ''
  console.log('[verify token]', token)

  try {
    if (token === '') {
      throw new Error(`No token to be verified.`)
    }

    const decTok = jwt.decode(token)
    const username = decTok['loggedInAs'] || '';
    const scope = decTok['scope'] || []

    jwt.verify(token, secret)
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
