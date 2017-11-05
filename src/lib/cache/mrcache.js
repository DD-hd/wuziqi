'use strict';

/**
 * @file MRCache(Memory Redis Cache) Lib
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const MemoryStore = require('./memory');
const RedisStore = require('./redis');
const debug = require('debug')('ecache:mrcache');

const isEmptyValue = (v) => {
  return (v === undefined || v === null);
};

class MRCache {
	
  constructor(options) {
    const {
      memory = {},
      redis = {},
      cacheEmpty = true,
      debug = false,
    } = options;
    this.mCache = new MemoryStore(memory);
    this.rCache = new RedisStore(redis);
    this._cacheEmpty = cacheEmpty;
    this._debug = debug;
  }
	
  get(key) {
    const data = this.mCache.get(key);
    debug('mCache:', data);
    if(data !== undefined) return Promise.resolve(data);
    return this.rCache.get(key).then(res => {
      debug('rCache:', res);
      if(res || this._cacheEmpty) {
        this.mCache.set(key, res);
      }
      return res;
    });
  }
	
  set(key, data, ttl = this.ttl) {
    if(data || this._cacheEmpty) {
      this.mCache.set(key, data);
      return this.rCache.set(key, data);
    }
    return Promise.resolve();
  }
	
  delete(key) {
    this.mCache.delete(key);
    return this.rCache.delete(key);
  }

}

module.exports = MRCache;
