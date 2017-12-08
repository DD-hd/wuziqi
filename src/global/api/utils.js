'use strict';

/**
 * @file API Utils
 * @author Yourtion Guo <yourtion@gmail.com>
 */
const resolvePath = require('path').resolve;

/**
 * 获取调用当前函数的源码地址
 *
 * @param {String} dir 项目所在目录
 * @return {String} 返回调用堆栈中第一个项目所在目录的文件
 */
exports.getCallerSourceLine = function getCallerSourceLine(dir) {
  const resolvedDir = resolvePath(dir);
  const stack = (new Error()).stack.split('\n').slice(1);
  for (let line of stack) {
    line = line.trim();
    if (line.replace(/\\/g, '/').indexOf(resolvedDir) !== -1) {
      const s = line.match(/\((.*)\)\s*$/);
      if (s) {
        return {
          relative: s[1].slice(resolvedDir.length + 1),
          absolute: s[1],
        };
      }
    }
  }
  return { relative: null, absolute: null };
};

/**
 * 获取API的Key
 *
 * @param {String} method
 * @param {String} path
 * @return {String}
 */
exports.getSchemaKey = function getSchemaKey(method, path) {
  return `${ method.toUpperCase() }_${ path }`;
};

/**
 * 返回安全的JSON字符串
 *
 * @param {Object} data
 * @param {String|Number} space 缩进
 * @return {String}
 */
exports.jsonStringify = function jsonStringify(data, space) {
  const seen = [];
  return JSON.stringify(data, function (key, val) {
    if (!val || typeof val !== 'object') {
      return val;
    }
    if (seen.indexOf(val) !== -1) {
      return '[Circular]';
    }
    seen.push(val);
    return val;
  }, space);
};