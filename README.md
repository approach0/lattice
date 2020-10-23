# Lattice
Fun fact: The first ever lattice-based cryptography algorithm is invented in 1994, which is the same year Shor algorithm is invented.

However this project is naming itself this way, has nothing to do with lattice. This is yet another simple authentication Web service.
(:unamused: :frowning_face: Booing...) 

## Usage
1. Start a database server at `localhost`.

2. Install packages and setup lattice server:
```
$ npm install
$ node ./authd.js
```

3. Test and change passowrd
Test the service by
```
$ node test/test-authd.js
```

Change the initial user `admin` password (with factory-setting password `changeme!`)
```
$ node db.js --reset --password <YOUR_PASSWORD>
```

4. Visit `http://localhost:19721/forbidden/whatever/place` in your browser.

## Environment variable
To connect to host at different address than `localhost`, set environment variable `LATTICE_DATABASE_HOST`.
