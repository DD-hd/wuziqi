'use strict';

/**
 * @file 七牛
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const qiniu = require('qiniu');
const { log4js, config, utils } = require('../global');
const logger = log4js.getLogger();
const conf = config.qiniu;
const qConfig = new qiniu.conf.Config();

const mac = new qiniu.auth.digest.Mac(conf.key, conf.secret);
const bucketManager = new qiniu.rs.BucketManager(mac, qConfig);

const { pubBucket, pubUrl, priBucket, priUrl } = conf;

logger.debug('Init Qiniu');

exports.uploadUrl = conf.uploadUrl;

/**
 * 判断是非为私有类型文件
 */
exports.isPrivate = (type) => {
  return [ 'avatar', 'thumbnail', 'public' ].indexOf(type) === -1;
};

/**
 * 获取文件key
 */
exports.getFileKey = (type, suffix) => {
  const date = utils.date('Ymd');
  const fileName = `${ utils.randomString(16).toLowerCase() }.${ suffix }`;
  return [ conf.prefix, type, date, fileName ].join('/');
};

/**
 * 获取上传Token
 * @param {String} bucket 
 * @param {String} fileKey 
 */
const getUploadToken = (bucket, fileKey) => {
  logger.trace('getUploadToken', bucket, fileKey);
  const options = {
    scope: bucket + ':' + fileKey,
    expires: conf.upload_token_expires,
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
};

/**
 * 获取公开上传 Token
 */
exports.getPublicUploadToken = (fileKey) => {
  return getUploadToken(pubBucket, fileKey);
};

/**
 * 获取公开下载地址
 */
const getPublicDownloadUrl = exports.getPublicDownloadUrl = (fileKey) => {
  return pubUrl + '/' + fileKey;
};

/**
 * 获取私有上传 Token
 */
exports.getPrivateUploadToken = (fileKey) => {
  return getUploadToken(priBucket, fileKey);
};

/**
 * 获取私有下载地址
 */
const getPrivateDownloadUrl = exports.getPrivateDownloadUrl = (fileKey) => {
  logger.trace('getPrivateDownloadUrl', fileKey);
  const deadline = parseInt(Date.now() / 1000, 10) + conf.download_token_expires;
  return bucketManager.privateDownloadUrl(priUrl, fileKey, deadline);
};

exports.getDownloadUrl = (fileKey) => {
  if (!fileKey) return { private: false, url: '' };
  const type = fileKey.split('/', 2)[1];
  const isPrivate = exports.isPrivate(type);
  return {
    private: isPrivate,
    url: isPrivate ? getPrivateDownloadUrl(fileKey) : getPublicDownloadUrl(fileKey),
  };
};
