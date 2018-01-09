'use strict';

/**
 * @file Lock Lib
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const assert = require('assert');
/**
  * Redis 分布式锁
  */
class Lock {

  /**
   * @param {Object} options
   */
  constructor(redis, options = {}) {
    assert(redis, 'must have redis client');
    this.client = redis;
    this.prefix = options.prefix ? 'l:' + options.prefix : 'l:' + new Date().getTime();
    this.timeout = options.timeout || 1000;
    this.error = options.error || new Error('acquire lock fail');
  }

  /**
   * 获取key
   * @param {String} key 标识
   */
  _getKey(key) {
    return this.prefix + ':' + key;
  }
  
  /**
   * 尝试获取锁，获取失败返回null
   * @param {String} key 标识
   * @param {Number} timeout 超时时间(ms)
   */
  get(key = 'default', timeout = this.timeout) {
    return this.client.set(this._getKey(key), new Date().getTime(), 'PX', timeout, 'NX');
  }

  /**
   * 尝试获取锁，获取失败抛出错误
   * @param {String} key 标识
   * @param {Number} timeout 超时时间(ms)
   */
  acquire(key = 'default', timeout = this.timeout) {
    return this.get(key, timeout).then(res => {
      if(res !== 'OK') throw this.error;
      return !!res;
    });
  }

  /**
   * 释放锁
   * @param {String} key 标识
   */
  release(key = 'default') {
    return this.client.del(this._getKey(key));
  }

  /**
   * 检测是否有锁
   * @param {String} key 标识
   */
  isLocked(key = 'default') {
    return this.client.get(this._getKey(key)).then(res => !!res);
  }
	
}

module.exports = Lock;
