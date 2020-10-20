const axios = require('axios')

;(async function() {
  const cookie = await axios.post('http://localhost:19721/login/jwt',
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
  await axios.post('http://localhost:19721/verify/jwt',
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
