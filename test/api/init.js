const app = require('../../src/app');
const apiService = require('../../src/api');

const util = require('util');
const debug = require('debug')('api:test');

// TODO: 添加数据库清空重建
apiService.initTest(app);

function format(data) {
  debug(util.inspect(data, false, 5, true));
  if(data.success && data.result) {
    return [ null, data.result ];
  }
  return [ data.msg || data.message, null];
}

apiService.setFormatOutput(format);

function init() {
  require('mocha-generators').install();
  return apiService;
}

module.exports = init;
