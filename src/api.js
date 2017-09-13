'use strict';

/**
 * @file API文件
 * @author Yourtion Guo <yourtion@gmail.com>
 */
const { errors, API } = require('./global');

const INFO = {
  title: 'API-Framework',
  description: 'XXX系统API文档',
  version: new Date(),
  host: 'http://127.0.0.1:3001',
  basePath: '/api',
};

const GROUPS = {
  Index: '首页',
};

const apiService = new API({
  info: INFO,
  groups: GROUPS,
  path: require('path').resolve(__dirname, 'routers'),
  missingParameterError: errors.missingParameterError,
  invalidParameterError: errors.invalidParameterError,
  internalError: errors.internalError,
  errors: errors.ERROR_INFO,
});

module.exports = apiService;
