const axios = require('axios')
const { program } = require('commander')
const default_host = 'http://localhost:19721'

program
  .option('--host <host>', `specify the host. Default: ${default_host}`)
  .option('--password <password>', 'specify the password')
  .option('--wait <n>', 'wait n seconds before verify')
  .option('--verify-url <url>', 'overwrite the default verify URL')
program.parse(process.argv)

const host = program.host || default_host
const password = program.password || 'changeme!'
const default_verify_url = `${host}/verify/jwt`
const verify_url = program.verifyUrl || default_verify_url
const wait_time = program.wait || 0

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

    console.log(`Wait ${wait_time} seconds before verify @ ${verify_url}`)
    await new Promise((resolve, reject) => {
      setTimeout(resolve, wait_time * 1000)
    })

    await axios.post(verify_url,
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
