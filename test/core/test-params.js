'use strict';

const assert = require('chai').assert;

const apiService = require('../../src/api');
const { helper, TYPES } = require('../../src/global');
const paramsChecker = apiService.paramsChecker();
const schemaChecker = apiService.schemaChecker();

const stringP1 = helper.build(TYPES.String, 'StringSchema', true);
const stringP2 = helper.build(TYPES.String, 'StringSchema', true, 'Hello');
const stringP3 = helper.build(TYPES.TrimString, 'StringSchema');

const numP = helper.build(TYPES.Nufember, 'Number', true);
const intP = helper.build(TYPES.Integer, 'Int');
const enumP = helper.build(TYPES.ENUM, 'Int', true, undefined, ['A', 'B', 1]);
const jsonP = helper.build(TYPES.JSON, 'Json');

const schema1 = {
  stringP2, stringP3, numP, intP,
};

describe('Core - params checker', () => {

  it('Test - simple checker success', function () {
    assert.equal(paramsChecker('st1', '1', stringP1), '1');
    stringP3.format = true;
    assert.equal(paramsChecker('st2', ' 1 ', stringP3), '1');
    assert.equal(paramsChecker('nu1', '1', numP), 1);
    assert.equal(paramsChecker('en1', 'A', enumP), 'A');
    assert.deepEqual(paramsChecker('json', '{ "a": 1 }', jsonP), '{ "a": 1 }');
    jsonP.format = true;
    assert.deepEqual(paramsChecker('json', '{ "a": 1 }', jsonP), { a: 1 });
  });

  it('Test - ENUM', function () {
    assert.equal(paramsChecker('en1', 1, enumP), 1);
    const fn = () => paramsChecker('en2', 'C', enumP);
    assert.throw(fn);
  });

});

describe('Core - schema checker', () => {
  
  it('Test - schema checker success', function () {
    const data = { stringP2: 'a', numP: 1.02, intP: 2 };
    const res = schemaChecker(data, schema1);
    assert.deepEqual(res, data);
  });

  it('Test - schema remove not in schema success', function () {
    const data = { numP: 1.02, a: 'xxx' };
    const res = schemaChecker(data, schema1);
    assert.notExists(res.a);
  });

  it('Test - schema requied check throw', function () {
    const data = { a: 'xxx' };
    const fn = () => schemaChecker(data, schema1);
    assert.throw(fn);
  });

  it('Test - schema requiedOneof check ok', function () {
    const data = { numP: 123 };
    const res = schemaChecker(data, schema1, ['numP', 'stringP3']);
    data.stringP2 = 'Hello';
    assert.deepEqual(res, data);
  });
  
  it('Test - schema requiedOneof check throw', function () {
    const data = { a: 'xxx' };
    const fn = () => schemaChecker(data, schema1, ['numP', 'stringP3']);
    assert.throw(fn);
  });
});
