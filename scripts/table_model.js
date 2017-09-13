'use strict';

/**
 * @file 数据库 model 生成
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const { mysql, co } = require('../src/global');
const util = require('util');
const fs = require('fs');
const path = require('path');
const debug = require('debug')('exam:table_model:');

const MODELS_PATH = path.resolve(__dirname, '../src/models');

function firstUpperCase(str) {
  return str.replace(/^\S/, (s) => { return s.toUpperCase(); });
}

function underscore2camelCase(str) {
  return str
    .replace(/^[_.\- ]+/, '')
    .toLowerCase()
    .replace(/[_.\- ]+(\w|$)/g, (m, p1) => p1.toUpperCase());
}

function* tableInfo(name) {
  const res = yield mysql.queryAsync('show full columns from `' + name + '`');
  // console.log(res)
  return res;
}

function* tableToScheam(tableName) {
  const table = yield* tableInfo(tableName);
  return convertTable(table);
}

function convertTable(table) {
  const res = [];
  for (const row of table) {
    res.push(row.Field);
  }
  return res;
}

const genTable = co.wrap(function* (tableName) {
  debug(tableName);
  const tables = yield mysql.queryAsync('show table status where name = "' + tableName + '"');
  const res = yield* tableToScheam(tableName);
  const tableCommet = tables[0]['Comment'];
  // console.log(res,tableCommet);
  const resStr = util.inspect(res, false, null).replace(/\n/g, '');
  const tableString = firstUpperCase(underscore2camelCase(tableName));
  const str = `'use strict';
  
/**
* @file ${ tableName } model ${ tableCommet }
* @author Yourtion Guo <yourtion@gmail.com>
*/

const Base = require('./base');

class ${ tableString } extends Base {
  
  constructor(options) {
    const opt = Object.assign({
      fields: ${ resStr },
    }, options);
    super('${ tableName }', opt);
  }
  
}

module.exports = new ${ tableString }();
`;
  const modelPath = MODELS_PATH + '/' + tableName + '.js';
  if (!fs.existsSync(modelPath)) {
    fs.writeFileSync(modelPath, str, 'utf8');
  } else {
    throw new Error(`model ${ tableName } 已经存在`);
  }
});

debug(process.argv);

if (process.argv.length > 2) {
  genTable(process.argv[2])
    .then(_res => {
      console.log(`创建model ${ process.argv[2] }成功`);
      process.exit(0);
    })
    .catch(err => {
      console.log(err);
      process.exit(-1);
    });
} else {
  console.log('node table_model.js `tableName');
  process.exit(-1);
}
