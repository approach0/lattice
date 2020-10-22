# Lattice
Fun fact: The first ever lattice-based cryptography algorithm is invented in 1994, which is the same year Shor algorithm is invented.

However this project is naming itself this way, has nothing to do with lattice. This is yet another simple authentication Web service.
(:unamused: :frowning_face: Booing...) 

## Usage
1. Start a database server at `localhost`.

2. Install packages and create the initial user `admin` (with factory-setting password `changeme!`)
```
$ npm install
$ node db.js --init
```

3. setup lattice server:
```
$ node ./authd.js
```
you can test the service by
```
$ node test/test-authd.js
```

To connect to host at different address than `localhost`, set environment variable `LATTICE_DATABASE_HOST`.

4. Finally, visit `http://localhost:19721/forbidden/whatever/place` in your browser.
