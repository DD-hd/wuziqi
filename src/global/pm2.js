'use strict';

/**
 * @file PM2 中间件
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const pmx = require('pmx').init({ network: true });
const probe = exports.probe = pmx.probe();

const counter = probe.counter({
  name: 'Realtime user',
});

exports.meter = (req, res, next) => {
  counter.inc();
  const _send = res.send;
  res.send = function () {
    counter.dec();
    return _send.apply(res, arguments);
  };
  next();
};
