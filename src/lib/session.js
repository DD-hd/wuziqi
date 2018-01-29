const { redis, config } = require('../global')
const session = require('express-session')
const RedisStore = require('connect-redis')(session);


exports.store = new RedisStore({
    client: redis,
    prefix: config.sessionPrefix,
})

const sessionOption = {
    store: exports.store,
    secret: config.sessionSecret,
    resave: false,
    httpOnly: false,
    name: config.cookieName || config.sessionPrefix,
    cookie: {
        maxAge: 3600000 * 12,
    },
    maxAge: config.cookieMaxAge,
    saveUninitialized: false,
}


exports.session = session(sessionOption);