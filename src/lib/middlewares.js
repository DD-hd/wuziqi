'use strict';

/**
 * @file 中间件
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const { config, redis, log4js } = require('../global');
const { session } = require('./session')
const logger = log4js.getLogger();

exports.session = session
exports.socketCookieParser = require('socket.io-cookie-parser')
exports.socketSession = (socket, next) => {
    session(socket.request, socket.request.res, next)
}


exports.cros = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , Cookie');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, PATCH');
    next();
};

exports.parsePages = function(req, res, next) {
    const param = req.$params || req.query;
    const page = param.page && Number(param.page) || 1;
    const pageCount = param.page_count && Number(param.page_count) || 30;
    const order = param.order;
    const asc = param.asc;
    req.$pages = {
        page,
        limit: pageCount,
        offset: (page - 1) * pageCount,
        order,
        asc,
    };
    Object.assign(req.$params, req.$pages);
    logger.trace('parsePages: ', req.$pages);
    next();
};