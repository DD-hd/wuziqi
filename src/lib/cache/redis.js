const Redis = require('ioredis');

class RedisCache {
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
	
  get(key) {
    return this.client.get(key).then(this._parseJSON);
  }
		
  set(key, data, ttl = this.ttl) {
    const text = this._jsonStringify(data);
    return this.client.set(key, text, 'EX', ttl);
  }
		
  delete(key) {
    return this.client.del(key);
  }
	
}

module.exports = RedisCache;
