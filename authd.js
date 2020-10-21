const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')

const authJWT = require('./auth-jwt.js')
const middleware = require('./middleware.js')

/* create JWT verify middleware */
let jwt_verify = middleware.reject

/* JWT token server */
const secretd = express()
const secret_port = 64264

/* JWT login server */
const app = express()
const port = 19721
app.use(bodyParser.json())
app.use(cookieParser())

secretd.get('/', function(req, res) { res.send(authJWT.getJWTSecret()) })
secretd.listen(secret_port, async function() {
  console.log('JWT token served at port', secret_port)

  jwt_verify = await middleware.jwt_verifier(`http://localhost:${secret_port}/`)

  app.listen(port)
  console.log(`Listening at port ${port}.`)

  app
  .post('/login/jwt', async function (req, res) {
    const reqJson = req.body || {}
    const username = reqJson.username || ''
    const password = reqJson.password || ''
    const debug = reqJson.debug || false

    const [pass, msg] = await authJWT.login(username, password, debug)
    console.log(pass ? 'passed' : 'failed', msg)

    if (pass) {
      res.cookie('lattice-jwt-token', msg.token, {
        maxAge: msg.info.maxAge * 1000,
        httpOnly: false /* prohibit js access to this cookie */
      })
    }

    res.json({ pass, msg })
  })

  .post('/verify/jwt', jwt_verify, function (req, res) {
    res.json({
      'pass': true
    })
  })

  /* some test routings */
  .get('/login', async function (req, res) {
    res.sendFile(path.resolve('./test/login.html'))
  })
  .get('/forbidden/*', jwt_verify, async function (req, res) {
    res.send('<b>This is a forbidden place!</b>')
  })

})
