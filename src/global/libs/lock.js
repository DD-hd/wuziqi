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
    this.prefix = 'l:' + options.prefix || 'l:' + new Date().getTime();
    this.timeout = options.timeout || 1000;
  }

  _getKey(key) {
    return this.prefix + ':' + key;
  }
  
  acquire(key = 'default', timeout = this.timeout) {
    return this.client.set(this._getKey(key), new Date().getTime(), 'PX', timeout, 'NX');
  }

  release(key = 'default') {
    return this.client.del(this._getKey(key));
  }

  isLocked(key = 'default') {
    return this.client.get(this._getKey(key)).then(res => !!res);
  }
	
}

module.exports = Lock;
