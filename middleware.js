const auth_jwt = require('./auth-jwt.js')
const loginUrl = '/login?next=<url>'

exports.no_verify = function(req, res, next) {
  return next()
}

exports.jwt_verify = function(req, res, next) {
  const token = req.cookies['lattice-jwt-token'] || ''
  const originUrl = req.url
  const originUrlEncoded = encodeURIComponent(originUrl)
  const redirectUrl = loginUrl.replace('<url>', originUrlEncoded)

  auth_jwt.verify(token)
  .then(ret => {
    const [pass, info] = ret
    if (pass) {
      next()

    } else {
      /* failed verification */
      const reqContentType = req.accepts('html', 'json')
      if (reqContentType == 'json') {
        /* POST request, send redirect info */
        res.json({
          'pass': false,
          'redirect': redirectUrl,
          'msg': info
        })
      } else {
        /* GET/HEAD request, send 302 code */
        res.redirect(redirectUrl)
      }
    }
  })
}
