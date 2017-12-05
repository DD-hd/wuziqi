'use strict';

/**
 * @file MemoryStore Lib
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const Redis = require('ioredis');

/**
  * Redis 缓存
  */
class RedisCache {

  /**
   * @param {Object} options
   */
  constructor(options) {
    this.client = new Redis({
      host: options.host || '127.0.0.1',
      port: options.port || 6379,
      db: options.db || 0,
      prefix: options.keyPrefix ? options.keyPrefix + 'c:' : 'cache:',
      password: options.password,
    });
    this.ttl = options.ttl || 600;
  }
	
  _parseJSON(json) {
    if (typeof json !== 'string') return null;
    try {
      return JSON.parse(json);
    } catch (err) {
      return null;
    }
  }
	
  _jsonStringify(data) {
    try {
      return JSON.stringify(data) || 'null';
    } catch (err) {
      return 'null';
    }
  }
  
  /**
   * 获取值
   * @param {String} key Key
   * @returns {Promise}
   */
  get(key) {
    return this.client.get(key).then(this._parseJSON);
  }
  
  /**
   * 设置值
   * @param {String} key Key
   * @param {Any} data 数据
   * @param {Number} ttl TTL
   * @returns {Promise}
   */
  set(key, data, ttl = this.ttl) {
    const text = this._jsonStringify(data);
    return this.client.set(key, text, 'EX', ttl);
  }
  
  /**
   * 删除值
   * @param {String} key
   * @returns {Promise}
   */
  delete(key) {
    return this.client.del(key);
  }
	
}

module.exports = RedisCache;
