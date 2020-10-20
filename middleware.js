const axios = require('axios')
const auth_jwt = require('./auth-jwt.js')
const loginUrl = '/login?next=<url>'

exports.reject = function (req, res, next) {
  const originUrlEncoded = encodeURIComponent(req.url || '/')
  const redirectUrl = loginUrl.replace('<url>', originUrlEncoded)
  const reqContentType = req.accepts('html', 'json')
    console.log('REJECT')

  if (reqContentType == 'json') {
    /* handle POST request rejection */
    res.json({
      'pass': false,
      'redirect': redirectUrl
    })
  } else {
    /* GET/HEAD request, send 302 code */
    res.redirect(redirectUrl)
  }
}

exports.jwt_verifier = async function(jwt_secret_url) {
  const url = jwt_secret_url
  let secret = ''
  try {
    const response = await axios.get(url)
    secret = response.data
  } catch (err) {
    console.error('failed to obtain secret from', url)
    console.error(err.toString())
  }

  return function (req, res, next) {
    const token = req.cookies['lattice-jwt-token'] || ''

    auth_jwt.verify(token, secret).then(ret => {
      const [pass, msg] = ret
      console.log(pass ? 'passed' : 'failed', msg)
      if (pass) {
        next()
      } else {
        exports.reject(req, res, next)
      }
    })
  }
}
