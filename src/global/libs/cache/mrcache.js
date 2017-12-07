'use strict';

/**
 * @file MRCache(Memory Redis Cache) Lib
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const MemoryStore = require('./memory');
const RedisStore = require('./redis');
const events = require('events');
const debug = require('debug')('ecache:mrcache');

/**
 * 内存+Redis 二级缓存
 */
class MRCache {
  
  /**
   * @param {Object} options
   */
  constructor(options) {
    const {
      memory = {},
      redis = {},
      cacheEmpty = true,
    } = options;
    this.mCache = new MemoryStore(memory);
    this.rCache = new RedisStore(redis);
    this._cacheEmpty = cacheEmpty;
    this.emitter = new events.EventEmitter();
  }
  
  /**
   * 获取值
   * @param {String} key Key
   * @returns {Promise}
   */
  get(key) {
    const data = this.mCache.get(key);
    debug('mCache:', data);
    if(data !== undefined) return Promise.resolve(data);
    return this.rCache.get(key).then(res => {
      debug('rCache:', res);
      if(res || this._cacheEmpty) {
        this.mCache.set(key, res);
      }
      return res !== null ? res : undefined;
    });
  }
  
  /**
   * 设置值
   * @param {String} key Key
   * @param {Any} data 数据
   * @param {Number} ttl TTL
   * @returns {Promise}
   */
  set(key, data, ttl = this.ttl) {
    debug('set:', key, data, ttl);
    if(data || this._cacheEmpty) {
      this.mCache.set(key, data);
      return this.rCache.set(key, data, ttl);
    }
    return Promise.resolve();
  }
  
  /**
   * 删除值
   * @param {String} key
   * @returns {Promise}
   */
  delete(key) {
    debug('set:', key);
    this.mCache.delete(key);
    return this.rCache.delete(key);
  }

}

module.exports = MRCache;
