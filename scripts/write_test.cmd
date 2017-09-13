cd $(pwd)

set NODE_ENV=test
set DEBUG=exam:test*
set LOG=true
mocha --watch test/api/test-%1.js
