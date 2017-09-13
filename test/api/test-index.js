'use strict';

const assert = require('chai').assert;

const apiService = require('./init')();
const agent = apiService.test.session();

const share = {};

describe('API - Index', () => {

  it('TEST', function* () {
    const ret = yield agent.get('/api/index')
      .takeExample('TEST')
      .output.success();
    assert.equal(ret, 'Hello, API Framework Index');
  });

});
