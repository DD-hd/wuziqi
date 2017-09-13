const fs = require('fs');
const path = require('path');
const debug = require('debug')('exam:table_model:');

const CONTROLLER_PATH = path.resolve(__dirname, '../src/routers/');
const genTable = (name) => {
  debug(name);
  const str = `'use strict';
/**
 * @file 专题路由
 * @author Yourtion Guo <yourtion@gmail.com>
 */
const ${ name }Controller = require('../controllers/${ name }');
const { helper, TYPES } = require('../global');
const { middlewares } = require('../lib');
const ${ name }Schema = require('../schemas/${ name }');

module.exports = (api) => {

    api.post('/${ name }')
        .group('${ name }')
        .title('${ name }')
        .query(Object.assign({
            id: ${ name }Schema.id,
        }, helper.Integer))
        .middlewares(
            middlewares.parsePages
        )
        .register(${ name }Controller.add${ name });
};
`;
  const _path = CONTROLLER_PATH + '/' + name + '.js';
  if (!fs.existsSync(_path)) {
    fs.writeFileSync(_path, str, 'utf8');
  } else {
    throw new Error(`router ${ name } 已经存在`);
  }
};

debug(process.argv);

if (process.argv.length > 2) {
  genTable(process.argv[2])
    .then(_res => {
      console.log(`创建router ${ process.argv[2] }成功`);
      process.exit(0);
    })
    .catch(err => {
      console.log(err.message);
      process.exit(-1);
    });
} else {
  console.log('node create_router.js `routerName');
  process.exit(-1);
}
