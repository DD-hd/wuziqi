'use strict';

/**
 * @file 开发环境 - Dev
 * @author Yourtion Guo <yourtion@gmail.com>
 */

module.exports = {
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 2,
    keyPrefix: 'examination:',
    showFriendlyErrorStack: true,
  },
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'exam',
  },
  alidayu: {
    accessKey: 'xxxxx',
    secretKey: 'xxxxx',
    signName: 'xx',
    templateAuth: 'xx',
    templateSuccess: 'xxxx',
    templateFail: 'xxx',
    templateMsg: 'xxxx',
  },
  qiniu: {
    key: 'dasdadsd',
    secret: 'dsadadad',
    uploadUrl: 'http://upload-z2.qiniu.com',
    pubBucket: 'test-public',
    pubUrl: 'http://ouvjfhafx.bkt.clouddn.com',
    priBucket: 'test-private',
    priUrl: 'http://ouvjwor3j.bkt.clouddn.com',
    prefix: 'exam',
    upload_token_expires: 3600,
    download_token_expires: 3600,
  },
};
