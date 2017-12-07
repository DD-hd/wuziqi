#/bin/sh

cd $(pwd)

export NODE_ENV=test
export DEBUG=eapi:test*
export LOG=true
mocha --watch test/api/test-$1.js
