const axios = require('axios')
const { program } = require('commander')
const default_host = 'http://localhost:19721'

program
  .option('--host <host>', `specify the host. Default: ${default_host}`)
  .option('--password <password>', 'specify the password')
program.parse(process.argv)

const host = program.host || default_host
const password = program.password || 'changeme!'

;(async function() {
  const cookie = await axios.post(`${host}/login/jwt`,
    {
      username: 'admin',
      password: password,
      debug: true
    }
  ).then(res => {
    console.log(res.data)
    const cookies = res.headers['set-cookie']
    if (cookies) return cookies[0]
  }).catch(err => {
    console.error(err.toString())
  })

  if (cookie) {
    console.log('Cookie:', cookie)
    await axios.post(`${host}/verify/jwt`,
      { foo: 'foo', bar: 'bar'},
      {
        headers: {
          Cookie: cookie
        }
      }

    ).then(res => {
      console.log(res.data)
    }).catch(err => {
      console.error(err.toString())
    })
  } else {
    console.error('no cookie set.')
  }

})()
