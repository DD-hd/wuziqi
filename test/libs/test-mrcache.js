'use strict';
require('mocha-generators').install();

const assert = require('chai').assert;
const coroutine = require('express-coroutine').coroutine;
const MRCache = require('../../src/lib/cache/mrcache');

const KEY = 'mr';
const VALUES = [
  { a: 1, b: { b: 1 }},
  'Hello Yourtion',
  12.02,
  null,
];
const VAL_OBJ = VALUES[0];

describe('Libs - MRCache cacheEmpty', () => {
  const cache = new MRCache({
    memory: { ttl: 0.1 },
    redis: { ttl: 1 },
    cacheEmpty: true,
  });
  
  it('Test - simple get set delete', function* () {
    assert.isNull(yield cache.get(KEY));
    for(const val of VALUES) {
      yield cache.set(KEY, val);
      assert.deepEqual(yield cache.get(KEY), val);
      assert.deepEqual(yield cache.get(KEY), val);
      yield cache.delete(KEY);
      assert.isNull(yield cache.get(KEY));
    }
  });

  it('Test - cache expire', function* () {
    yield cache.set(KEY, VAL_OBJ);
    assert.deepEqual(yield cache.get(KEY), VAL_OBJ);
    assert.deepEqual(yield cache.get(KEY), VAL_OBJ);
    yield coroutine.delay(100);
    assert.deepEqual(yield cache.get(KEY), VAL_OBJ);
    assert.deepEqual(yield cache.get(KEY), VAL_OBJ);
    yield coroutine.delay(1000);
    assert.isNull(yield cache.get(KEY));
  });

});

describe('Libs - MRCache not cacheEmpty', () => {
  const cache = new MRCache({
    memory: { ttl: 0.1 },
    redis: { ttl: 1 },
    cacheEmpty: false,
  });
    
  it('Test - simple get set delete', function* () {
    assert.isNull(yield cache.get(KEY));
    assert.isNull(yield cache.get(KEY));
    for(const val of VALUES) {
      yield cache.set(KEY, val);
      assert.deepEqual(yield cache.get(KEY), val);
      assert.deepEqual(yield cache.get(KEY), val);
      yield cache.delete(KEY);
      assert.isNull(yield cache.get(KEY));
    }
  });
  
  it('Test - cache expire', function* () {
    yield cache.set(KEY, VAL_OBJ);
    assert.deepEqual(yield cache.get(KEY), VAL_OBJ);
    assert.deepEqual(yield cache.get(KEY), VAL_OBJ);
    yield coroutine.delay(100);
    assert.deepEqual(yield cache.get(KEY), VAL_OBJ);
    assert.deepEqual(yield cache.get(KEY), VAL_OBJ);
    yield coroutine.delay(1000);
    assert.isNull(yield cache.get(KEY));
  });
  
});
