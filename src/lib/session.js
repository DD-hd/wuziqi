const { redis, config } = require('../global')
const session = require('express-session')
const cookie = require('cookie');
const debug = require('debug')('express-session');
const signature = require('cookie-signature')
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

exports.getSession = (req) => {
    const sid = exports.getCookie(req, sessionOption.name)
    return new Promise((resolve, reject) => {
        exports.store.get(sid, (err, session) => {
            if (err) {
                return reject(err)
            }
            resolve(session)
        })
    })
}



exports.getCookie = (req, name, secrets = sessionOption.secret) => {
    var header = req.headers.cookie;
    var raw;
    var val;

    if (Array.isArray(secrets) && secrets.length === 0) {
        throw new TypeError('secret option array must contain one or more strings');
    }

    if (secrets && !Array.isArray(secrets)) {
        secrets = [secrets];
    }

    if (header) {
        var cookies = cookie.parse(header);

        raw = cookies[name];
        if (raw) {
            if (raw.substr(0, 2) === 's:') {
                val = unsigncookie(raw.slice(2), secrets);
                if (val === false) {
                    debug('cookie signature invalid');
                    val = undefined;
                }
            } else {
                debug('cookie unsigned')
            }
        }
    }

    if (!val && req.signedCookies) {
        val = req.signedCookies[name];

        if (val) {
            deprecate('cookie should be available in req.headers.cookie');
        }
    }

    // back-compat read from cookieParser() cookies data
    if (!val && req.cookies) {
        raw = req.cookies[name];

        if (raw) {
            if (raw.substr(0, 2) === 's:') {
                val = unsigncookie(raw.slice(2), secrets);

                if (val) {
                    deprecate('cookie should be available in req.headers.cookie');
                }

                if (val === false) {
                    debug('cookie signature invalid');
                    val = undefined;
                }
            } else {
                debug('cookie unsigned')
            }
        }
    }

    return val;
}

function unsigncookie(val, secrets) {
    for (var i = 0; i < secrets.length; i++) {
        var result = signature.unsign(val, secrets[i]);

        if (result !== false) {
            return result;
        }
    }

    return false;
}