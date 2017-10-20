'use strict';

/**
 * @file API 参数检测
 * 参考 hojs
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const debug = require('./debug').params;

const paramsChecker = (ctx, name, value, typeInfo) => {
  const type = ctx.type.get(typeInfo.type);
  let result = value;
  // 如果类型有 parser 则先执行
  if (type.parser) {
    debug(`param ${ name } run parser`);
    result = type.parser(result);
  }

  // 如果类型有 checker 则检查
  if (!type.checker(result, typeInfo.params)) {
    debug(`param ${ name } run checker`);
    let msg = `'${ name }' should be valid ${ typeInfo.type }`;
    if (typeInfo.params) {
      msg = `${ msg } with additional restrictions: ${ typeInfo._paramsJSON }`;
    }
    throw ctx.error.invalidParameter(msg);
  }

  // 如果类型有 formatter 且开启了 format=true 则格式化参数
  if (typeInfo.format && type.formatter) {
    debug(`param ${ name } run format`);
    debug(`befor format : ${ result }`);
    result = type.formatter(result, typeInfo.params);
    debug(`after format : ${ result }`);
  }
  return result;
};

const schemaChecker = (ctx, data, schema) => {
  const result = {};
  for(const name in schema) {
    let value = data[name];
    const options = schema[name];
    debug(`param check ${ name } : ${ value } with ${ options }`);

    if(typeof value === 'undefined') {
      if (options.default) {
        // 为未赋值参数添加默认值默认值
        value = options.default;
      } else {
        // 其他情况忽略
        continue;
      }
    }
    result[name] = paramsChecker(ctx, name, value, options);
  }
  // 必填参数检查
  if (schema.options.required.size > 0) {
    for (const name of schema.options.required) {
      if (!(name in result)) throw ctx.error.missingParameter(`'${ name }' is required!`);
    }
  }

  // 可选参数检查
  if (schema.options.requiredOneOf.size > 0) {
    for (const names of schema.options.requiredOneOf) {
      let ok = false;
      for (const name of names) {
        ok = typeof result[name] !== 'undefined';
        if (ok) break;
      }
      if (!ok) {
        throw ctx.error.missingParameter(`one of ${ names.join(', ') } is required`);
      }
    }
  }
  return result;
};

/**
  * API 参数检查
  * 
  * @param {Object} ctx 上下文
  * @param {Object} schema 定义
  * @returns {Function} 中间件
  */
function apiCheckParams(ctx, schema) {
  return (req, res, next) => {
    const newParams = {};
    for(const place of [ 'query', 'params', 'body' ]) {
      const pOptions = schema.options[place];
      for(const name in pOptions) {

        let value = req[place][name];
        const options = pOptions[name];
        debug(`param check ${ name } : ${ value } with ${ options }`);
        
        if(typeof value === 'undefined') {
          if (options.default) {
            // 为未赋值参数添加默认值默认值
            value = options.default;
          } else {
            // 其他情况忽略
            continue;
          }
        }
        
        newParams[name] = paramsChecker(ctx, name, value, options);
      }
    }

    // 必填参数检查
    if (schema.options.required.size > 0) {
      for (const name of schema.options.required) {
        if (!(name in newParams)) throw ctx.error.missingParameter(`'${ name }' is required!`);
      }
    }

    // 可选参数检查
    if (schema.options.requiredOneOf.size > 0) {
      for (const names of schema.options.requiredOneOf) {
        let ok = false;
        for (const name of names) {
          ok = typeof newParams[name] !== 'undefined';
          if (ok) break;
        }
        if (!ok) {
          throw ctx.error.missingParameter(`one of ${ names.join(', ') } is required`);
        }
      }
    }

    req.$params = newParams;
    next();
  };
}

module.exports = { apiCheckParams, paramsChecker, schemaChecker };
