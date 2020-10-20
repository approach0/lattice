# Lattice
Fun fact: The first ever lattice-based cryptography algorithm is invented in 1994, which is the same year Shor algorithm is invented.

However the way this project is naming itself, has nothing to do with lattice. This is yet another simple authentication Web service.

## Usage
Start a postgres server at localhost and setup lattice server:
```
$ node ./authd.js
```
and visit `http://localhost:19721/test/login.html`
