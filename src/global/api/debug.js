'use strict';

/**
 * @file API Debug
 * 参考 hojs
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const createDebug = require('debug');

/**
 * 创建一个调试输出函数
 *
 * @param {String} name
 * @return {Function}
 */
const create = exports.create = function create(name) {
  return createDebug('eapi:' + name);
};

exports.core = create('core');
exports.schema = create('schema');
exports.params = create('params');
exports.test = create('test');
exports.docs = create('docs');
exports.plugin = create('plugin');

exports.serviceDebug = create('service:debug');
exports.serviceInfo = create('service:info');
exports.serviceLog = create('service:log');
exports.serviceError = create('service:error');
