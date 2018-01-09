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
    this.queue = {};
    this.fnQueue = {};
    this.fnCache = {};
    this.fns = {};
  }
  
  /**
   * 获取值
   * @param {String} key Key
   * @returns {Promise}
   */
  get(key) {
    const data = this.mCache.get(key);
    debug('get mCache:', data);
    if(data !== undefined) return Promise.resolve(data);
    if(this.queue[key]) return this.queue[key];
    this.queue[key] = this.rCache.get(key).then(res => {
      debug('get rCache:', res);
      if(res || this._cacheEmpty) {
        this.mCache.set(key, res);
      }
      delete this.queue[key];
      return res !== null ? res : undefined;
    });
    return this.queue[key];
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
    debug('delete:', key);
    this.mCache.delete(key);
    return this.rCache.delete(key);
  }

  /**
   * 注册通过 fn 获取 key 数据方法
   * @param {String} key 获取数据Key
   * @param {Function} fn 获取数据方法
   */
  setData(key, fn) {
    debug('setData:', key);
    this.fns[key] = fn;
  }

  /**
   * 通过注册的 fn 获取数据并缓存
   * @param {String} key 获取数据Key
   * @param {Any} args 获取数据参数
   */
  getData(key, ...args) {
    const fn = this.fns[key];
    if(!fn) throw new Error(key + ' is not setData yet');
    const cacheKey = args.length > 0 ? key + JSON.stringify(args) : key;
    debug('getData:', key, args, cacheKey);
    if(!this.fnQueue[cacheKey]) {
      this.fnQueue[cacheKey] = this.get(cacheKey).then(data => {
        if(data !== undefined) {
          delete this.fnQueue[cacheKey];
          return data;
        }
        return fn(...args);
      }).then(res => {
        if(!this.fnQueue[cacheKey]) return res;
        return this.set(cacheKey, res);
      }).then(res2 => {
        if(!this.fnQueue[cacheKey]) return res2;
        delete this.fnQueue[cacheKey];
        if(!res2) return undefined;
        return this.get(cacheKey);
      });
    }
    return this.fnQueue[cacheKey];
  }
}

module.exports = MRCache;
