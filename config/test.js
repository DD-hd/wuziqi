'use strict';

/**
 * @file 测试环境 - Test
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const tmpFile = require('os').tmpdir();

module.exports = {
  loggerDebug: process.env.LOG || false,
  loggerPath: tmpFile,
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 3,
    keyPrefix: 'api:',
    showFriendlyErrorStack: true,
  },
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'exam_test',
  },
};
