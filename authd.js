const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path');

const jwt_verify = require('./middleware.js').jwt_verify
const jwt_login = require('./auth-jwt.js').login

/* set up http server */
const app = express()
const port = 19721
app.use(bodyParser.json())
app.use(cookieParser())

app.listen(port)
console.log(`Listening at port ${port}.`)

app
.post('/login/jwt', async function (req, res) {
  const reqJson = req.body || {}
  const username = reqJson.username || ''
  const password = reqJson.password || ''
  const debug = reqJson.debug || false

  console.log('[USER login]', username)
  const [pass, msg] = await jwt_login(username, password, debug)

  console.log(pass ? 'passed' : 'failed', msg)
  if (pass) {
    res.cookie('lattice-jwt-token', msg.token, {
      maxAge: msg.info.maxAge,
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
