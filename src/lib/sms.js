'use strict';

/**
 * @file 短信发送
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const Alidayu = require('dysms');
const { log4js, config, redis, coroutine, errors, utils } = require('../global');
const logger = log4js.getLogger();
const conf = config.alidayu;

const client = new Alidayu({
  AccessKeyId: conf.accessKey,
  AccessKeySecret: conf.secretKey,
});

logger.debug('Init AliYun SMS');

// 短信验证码 Redis Key 前缀
const AUTH_CODE_KEY = 'SMS_AUTH_CODE:';

/**
 * 获取手机验证码 Redis Key
 *
 * @param {Number} phone
 * @returns {String}
 */
function getKey(phone) {
  return AUTH_CODE_KEY + phone;
}

/**
 * 发送短信
 * @example
 * // returns Promise
 * sendSMS(18500083338, 'SMS_86695039', { user:"Yourtion" }, '钇钛网')
 *
 * @param {Number} phone 手机号
 * @param {Object} params 参数
 * @param {String} [template=conf.default_template] 模版
 * @param {String} [sign=conf.sign_name] 签名
 * @returns {Promise}
 *
 */
const sendSMS = exports.sendSMS = (phone, template, params, sign = conf.signName) => {
  const options = { phone, sign, template, params };
  logger.debug(options);
  if (config.env !== 'production') return Promise.resolve();
  // return Promise.resolve();
  return client.sms(options);
};

/**
 * 发送验证码
 *
 * @param {Number} phone 手机号
 * @returns {Promise}
 */
exports.sendAuthCode = coroutine.wrap(function* (phone) {
  if(!phone) throw errors.invalidParameterError('phone');
  const key = getKey(phone);
  const old_code = yield redis.get(key);
  const code = old_code ? old_code : utils.randomNumber(config.authCodeLength);
  yield redis.setex(key, config.authCodeMaxAge, code);
  yield exports.sendSMS(phone, conf.templateAuth, { code });
});

/**
 * 验证短信验证码
 *
 * @param {Number} phone 手机号
 * @param {Number} params 验证码
 * @returns {Promise}
 */
exports.verifyAuthCode = coroutine.wrap(function* (phone, code) {
  // eslint-disable-next-line eqeqeq
  if (config.env !== 'production' && code == '0000') return true;
  const key = getKey(phone);
  const c = yield redis.get(key);
  // eslint-disable-next-line
  return !!c && c == code ;
});

/**
 * 删除短信验证码
 *
 * @param {Number} phone 手机号
 * @returns {Promise}
 */
exports.deleteAuthCode = (phone) => {
  if(!phone) throw errors.invalidParameterError('phone');
  const key = getKey(phone);
  return redis.del(key);
};

/**
 * 发送短信消息
 */
exports.sendSMSMsgToUser = (phone, user, msg) => {
  if(!phone) throw errors.invalidParameterError('phone');
  logger.trace(`sendSMSMsgToUser - phone: ${ phone }, msg : ${ msg }`);
  return exports.sendSMS(phone, conf.templateMsg, { user });
};

/**
 * 发送注册成功短信
 */
exports.sendRegSuccessSMSToUser = (phone, user) => {
  if(!phone) throw errors.invalidParameterError('phone');
  if(!user) throw errors.invalidParameterError('user');
  logger.trace(`sendRegSuccessSMSToUser - phone: ${ phone }, user : ${ user }`);
  return sendSMS(phone, conf.templateSuccess, { user });
};

/**
 * 发送验证失败短信
 */
exports.sendRegFailSMSToUser = (phone, user, reason) => {
  if(!phone) throw errors.invalidParameterError('phone');
  if(!user) throw errors.invalidParameterError('user');
  if(!reason) throw errors.invalidParameterError('reason');
  logger.trace(`sendRegFailSMSToUser - phone: ${ phone }, user: ${ user }, reason: ${ reason }`);
  return sendSMS(phone, conf.templateFail, { user, reason });
};
