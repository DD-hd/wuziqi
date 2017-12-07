const fs = require('fs');
const path = require('path');
const debug = require('debug')('eapi:create_controller:');
const { utils } = require('../src/global');

const CONTROLLER_PATH = path.resolve(__dirname, '../src/controllers');
const genController = (name) => {
  debug(name);
  const nameCamel = utils.underscore2camelCase(name);
  const str = `'use strict';
/**
 * @file ${ nameCamel }控制器
 * @author Yourtion Guo <yourtion@gmail.com>
 */
const { ${ nameCamel }Model } = require('../models');
const { errors, log4js, utils } = require('../global');
const logger = log4js.getLogger();

/**
 * 获取列表
 */
exports.list = function* (req, res) {
  logger.trace('add${ nameCamel }: req.$params');
  const result=null;
  if(result){
     req.success();
  }else{
     req.error();
  }
};
`;
  const _path = CONTROLLER_PATH + '/' + name + '.js';
  if (fs.existsSync(_path)) {
    return Promise.reject(new Error(`controller ${ name } 已经存在`));
  }
  fs.writeFileSync(_path, str, 'utf8');
  return Promise.resolve(_path);
};

debug(process.argv);

if (process.argv.length > 2) {
  genController(process.argv[2])
    .then(_res => {
      console.log(`创建controller ${ process.argv[2] }成功`);
      process.exit(0);
    })
    .catch(err => {
      console.log(err.message);
      process.exit(-1);
    });
} else {
  console.log('node create_controller.js `controllerName');
  process.exit(-1);
}
