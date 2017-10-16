'use strict';

const KDNService = require('kdniaosdk').default;
const { log4js, config } = require('../global');
const logger = log4js.getLogger();
const conf = config.kdn;

const service = new KDNService({
  EBusinessID: conf.id,
  AppKey: conf.key,
});


exports.trace = (code, shipper = 'SF') => {
  return service.makeOrderTraceSync({ code, shipper });
}


exports.trace(457250347343, 'ZTO').then(console.log).catch(console.error);