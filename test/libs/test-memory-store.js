'use strict';

const assert = require('chai').assert;

const MemoryStore = require('../../src/global/libs/cache/memory');

const KEY = 'a';
const VALUES = [
  { a: 1, b: { b: 1 }},
  'Hello Yourtion',
  12.02,
  null,
];
const VAL_OBJ = VALUES[0];

describe('Libs - MemoryStore immutable true', () => {
  const cache = new MemoryStore({ ttl: 0.01 });
  
  it('Test - simple get set delete', function () {
    assert.isUndefined(cache.get(KEY));
    for(const val of VALUES) {
      cache.set(KEY, val);
      assert.deepEqual(cache.get(KEY), val);
      cache.delete(KEY);
      assert.isUndefined(cache.get(KEY));
    }
  });

  it('Test - immutable object', function () {
    assert.isUndefined(cache.get(KEY));
    cache.set(KEY, VAL_OBJ);
    const res = cache.get(KEY);
    assert.deepEqual(res, VAL_OBJ);
    assert.throw(() => {
      res.a = 1;
    });
  });

  it('Test - cache expire', function (done) {
    cache.set(KEY, VAL_OBJ);
    setTimeout(function (){
      assert.isUndefined(cache.get(KEY));
      done();
    }, 10);
  });

});

describe('Libs - MemoryStore immutable false', () => {
  const cache = new MemoryStore({ immutable: false, ttl: 0.01 });
  
  it('Test - simple get set delete', function () {
    assert.isUndefined(cache.get(KEY));
    for(const val of VALUES) {
      cache.set(KEY, val);
      assert.deepEqual(cache.get(KEY), val);
      cache.delete(KEY);
      assert.isUndefined(cache.get(KEY));
    }
  });

  it('Test - mutable object', function () {
    assert.isUndefined(cache.get(KEY));
    cache.set(KEY, VAL_OBJ);
    const res = cache.get(KEY);
    assert.deepEqual(res, VAL_OBJ);
    res.a = 2;
    assert.equal(res.a, 2);
    assert.deepEqual(cache.get(KEY), VAL_OBJ);
  });

  it('Test - cache expire', function (done) {
    cache.set(KEY, VAL_OBJ);
    setTimeout(function (){
      assert.isUndefined(cache.get(KEY));
      done();
    }, 10);
  });
});

