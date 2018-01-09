'use strict';
require('mocha-generators').install();

const assert = require('chai').assert;
const coroutine = require('express-coroutine').coroutine;
const MRCache = require('../../src/global/libs/cache/mrcache');

const KEY = 'mr';
const VALUES = [
  { a: 1, b: { b: 1 }},
  'Hello Yourtion',
  12.02,
  null,
];
const VAL_OBJ = VALUES[0];

const fetch = function fetch(d) {
  // eslint-disable-next-line
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if(d) resolve(new Date() + d);
      resolve(new Date());
    }, 10);
  });
};

describe('Libs - MRCache cacheEmpty', () => {
  const cache = new MRCache({
    memory: { ttl: 0.1 },
    redis: { ttl: 1 },
    cacheEmpty: true,
  });
  
  it('Test - simple get set delete', function* () {
    assert.isUndefined(yield cache.get(KEY));
    assert.isNull(yield cache.get(KEY));
    for(const val of VALUES) {
      yield cache.set(KEY, val);
      assert.deepEqual(yield cache.get(KEY), val);
      assert.deepEqual(yield cache.get(KEY), val);
      yield cache.delete(KEY);
      assert.isUndefined(yield cache.get(KEY));
    }
  });

  it('Test - ConcurrentGet', function* () {
    yield cache.delete(KEY);
    const all = yield Promise.all([cache.get(KEY), cache.get(KEY), cache.get(KEY)]);
    for(const i of all) {
      assert.isUndefined(i);
    }
    assert.isNull(yield cache.get(KEY));
  });

  it('Test - GetData', function* () {
    yield cache.delete(KEY);
    cache.setData(KEY, fetch);
    const all = yield Promise.all([cache.getData(KEY), cache.getData(KEY), cache.getData(KEY)]);
    const i0 = yield cache.getData(KEY);
    for(const i of all) {
      assert.equal(i0, i);
    }
  });

  it('Test - GetData with params', function* () {
    yield cache.delete(KEY);
    cache.setData(KEY, fetch);
    const all = yield Promise.all([cache.getData(KEY, 666), cache.getData(KEY, 666), cache.getData(KEY, 666)]);
    const i0 = yield cache.getData(KEY, 666);
    for(const i of all) {
      assert.equal(i0, i);
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
    assert.isUndefined(yield cache.get(KEY));
  });

});

describe('Libs - MRCache not cacheEmpty', () => {
  const cache = new MRCache({
    memory: { ttl: 0.1 },
    redis: { ttl: 1 },
    cacheEmpty: false,
  });
    
  it('Test - simple get set delete', function* () {
    assert.isUndefined(yield cache.get(KEY));
    for(const val of VALUES) {
      yield cache.set(KEY, val);
      if(val !== null) {
        assert.deepEqual(yield cache.get(KEY), val);
        assert.deepEqual(yield cache.get(KEY), val);
      }
      yield cache.delete(KEY);
      assert.isUndefined(yield cache.get(KEY));
    }
  });

  it('Test - ConcurrentGet', function* () {
    yield cache.delete(KEY);
    const all = yield Promise.all([cache.get(KEY), cache.get(KEY), cache.get(KEY)]);
    for(const i of all) {
      assert.isUndefined(i);
    }
    assert.isUndefined(yield cache.get(KEY));
  });

  it('Test - GetData', function* () {
    yield cache.delete(KEY);
    cache.setData(KEY, fetch);
    const all = yield Promise.all([cache.getData(KEY), cache.getData(KEY), cache.getData(KEY)]);
    const i0 = yield cache.getData(KEY);
    for(const i of all) {
      assert.equal(i0, i);
    }
  });

  it('Test - GetData with params', function* () {
    yield cache.delete(KEY);
    cache.setData(KEY, fetch);
    const all = yield Promise.all([cache.getData(KEY, 666), cache.getData(KEY, 666), cache.getData(KEY, 666)]);
    const i0 = yield cache.getData(KEY, 666);
    for(const i of all) {
      assert.equal(i0, i);
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
    assert.isUndefined(yield cache.get(KEY));
  });
  
});
