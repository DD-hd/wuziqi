'use strict';

/**
 * @file 中间件
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const { config, errors, redis, log4js } = require('../global');
const logger = log4js.getLogger();
const xss = require('xss');

exports.session = session({
  store: new RedisStore({
    client: redis,
    prefix: config.sessionPrefix,
  }),
  secret: config.sessionSecret,
  resave: true,
  saveUninitialized: true,
});

exports.xssFilter = (params) => {
  return (req, res, next) => {
    params.forEach((param) => {
      if (req.$params[param]) {
        req.$params[param] = xss(req.$params[param]);
      }
      next();
    });
  };
};

exports.parsePages = function (req, res, next) {
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
