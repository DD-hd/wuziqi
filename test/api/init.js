const app = require('../../src/app');
const apiService = require('../../src/api');

const util = require('util');
const debug = require('debug')('eapi:test');

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

function docOutputForamt(out) {
  const result = out && out.success && out.result;
  if(Array.isArray(out.result) && out.result.length > 2) {
    out.result = out.result.slice(0, 2);
  }
  [ 'list' ].forEach(li => {
    if(Array.isArray(result[li]) && result[li].length > 2) {
      result[li] = result[li].slice(0, 2);
    }
  });
  return out;
}
apiService.setDocOutputForamt(docOutputForamt);

function init() {
  require('mocha-generators').install();
  return apiService;
}

module.exports = init;
