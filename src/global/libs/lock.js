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
    this.ttl = options.ttl || 60;
  }

  _getKey(key) {
    return this.prefix + ':' + key;
  }
  
  acquire(key = 'default', ttl = this.ttl) {
    return this.client.set(this._getKey(key), new Date().getTime(), 'EX', ttl, 'NX');
  }

  release(key = 'default') {
    return this.client.del(this._getKey(key));
  }
	
}

module.exports = Lock;
