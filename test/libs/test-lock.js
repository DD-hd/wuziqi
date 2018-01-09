'use strict';
require('mocha-generators').install();

const assert = require('chai').assert;
const coroutine = require('express-coroutine').coroutine;
const Lock = require('../../src/global/libs/lock');
const { redis } = require('../../src/global');

describe('Libs - Redis Lock', () => {
  const lock = new Lock(redis, { timeout: 100 });

  beforeEach(function* () {
    yield lock.release();
  });
  
  it('Test - Default Lock acquire and release', function* () {
    assert.isFalse(yield lock.isLocked());
    assert.ok(yield lock.get());
    assert.isTrue(yield lock.isLocked());
    assert.isNull(yield lock.get());
    try {
      yield lock.acquire();
    } catch (error) {
      assert.equal(error.message, 'acquire lock fail');
    }
    yield lock.release();
    assert.ok(yield lock.acquire());
  });

  it('Test - Default Lock concurrent', function* () {
    const all = yield Promise.all([lock.get(), lock.get(), lock.get()]);
    assert.equal(all.length, 3);
    const res = all.filter(r => !!r);
    assert.equal(res.length, 1);
  });

  it('Test - Default Lock timeout', function* () {
    assert.ok(yield lock.acquire());
    assert.isNull(yield lock.get());
    yield coroutine.delay(10);
    assert.isNull(yield lock.get());
    try {
      yield lock.acquire();
    } catch (error) {
      assert.equal(error.message, 'acquire lock fail');
    }
    yield coroutine.delay(91);
    assert.isFalse(yield lock.isLocked());
    assert.ok(yield lock.get());
  });

});
