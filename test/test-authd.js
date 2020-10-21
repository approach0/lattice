const axios = require('axios')
const { program } = require('commander')

program
  .option('--host <host>', 'specify the host')
program.parse(process.argv)

const host = program.host || 'http://localhost:19721'

;(async function() {
  const cookie = await axios.post(`${host}/login/jwt`,
    {
      username: 'admin',
      password: 'changeme!',
      debug: true
    }
  ).then(res => {
    console.log(res.data)
    return res.headers['set-cookie'][0]
  }).catch(err => {
    console.error(err.toString())
  })

  console.log(cookie)
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

})()
