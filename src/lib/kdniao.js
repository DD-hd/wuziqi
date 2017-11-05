'use strict';

const KDNService = require('kdniaosdk').default;
const { config } = require('../global');
const conf = config.kdn;

const service = new KDNService({
  EBusinessID: conf.id,
  AppKey: conf.key,
});


exports.trace = (code, shipper = 'SF') => {
  return service.makeOrderTraceSync({ code, shipper });
};

// exports.trace(457250347343, 'ZTO').then(console.log).catch(console.error);
