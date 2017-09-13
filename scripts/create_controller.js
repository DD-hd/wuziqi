const fs = require('fs');
const path = require('path');
const debug = require('debug')('exam:table_model:');

const CONTROLLER_PATH = path.resolve(__dirname, '../src/controllers');
const genTable = (name) => {
  debug(name);
  const createTime = new Date().toString();
  const str = `'use strict';
/**
 * @author dd
 * @time ${ createTime }
 */
const ${ name }Model = require('../models/${ name }');
const { errors, log4js, utils } = require('../global');
const logger = log4js.getLogger();

/**
 * 获取考点列表
 */
exports.add${ name[0].toUpperCase() + name.slice(1) } = function* (req, res) {
  logger.trace('add${ name[0].toUpperCase() + name.slice(1) }: ');
  const result=null;
  if(result){
     req.success();
  }else{
     req.error();
  }
};
`;
  const _path = CONTROLLER_PATH + '/' + name + '.js';
  if (!fs.existsSync(_path)) {
    fs.writeFileSync(_path, str, 'utf8');
  } else {
    throw new Error(`controller ${ name } 已经存在`);
  }
  return _path;
};

debug(process.argv);

if (process.argv.length > 2) {
  genTable(process.argv[2])
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
