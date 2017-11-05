'use strict';

/**
 * @file MemCache Lib
 * @author Yourtion Guo <yourtion@gmail.com>
 */

class MemoryCache {
	
  constructor(options) {
    const { ttl = 30, immutable = true } = options;
    this.cache = {};
    this.ttl = ttl;
    this.immutable = immutable;
  }
	
  get(key) {
    const t = Date.now();
    const info = this.cache[key];
    if (info && info.expire > t) {
      if(this.immutable)return info.data;
      return JSON.parse(info.data);
    }
    delete this.cache[key];
    return;
  }
	
  set(key, data, ttl = this.ttl) {
    const cache = {
      expire: Date.now() + ttl * 1000,
    };
    if (this.immutable) {
      if(typeof data === 'object') {
        cache.data = Object.freeze(JSON.parse(JSON.stringify(data)));
      } else {
        cache.data = data;
      }
    } else {
      cache.data = JSON.stringify(data);
    }
    this.cache[key] = cache;
  }
	
  delete(key) {
    delete this.cache[key];
  }

}

module.exports = MemoryCache;

// const cache = new MemoryCache({ immutable: false });

// console.log('get', );

// cache.set('a', { a: 1 });
// const a = cache.get('a');
// a.a = 2;
// a.v = 3;
// console.log(a);

// console.log('get', cache.get('a'));

// cache.set('a', 2);

// console.log('get', cache.get('a'));

// cache.delete('a');

// console.log('get', cache.get('a'));
