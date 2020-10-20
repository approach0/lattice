const axios = require('axios');

(async function() {
await axios.post('http://localhost:19721/login/jwt',
  {
    username: 'admin',
    password: 'changeme!',
    debug: true
  }
).then(res => {
  console.log(res.data)

}).catch(err => {
  console.error(err.toString())

})

await axios.post('http://localhost:19721/verify/jwt',
  { foo: 'foo', bar: 'bar'}

).then(res => {
  console.log(res.data)

}).catch(err => {
  console.error(err.toString())

})

})()
