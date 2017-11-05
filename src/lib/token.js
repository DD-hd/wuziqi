const { log4js, config, co, redis } = require('../global');
const md5 = require('md5');
const logger = log4js.getLogger('system');
const redisKey = config.redisKey;
class TokenProvider {
  constructor(tokenList = {}, cacheLen = 8) {
    this.tokenList = tokenList;
    this.cacheLen = cacheLen;
  }
  _save(token, data) {
    const that = this;
    return co.wrap(function* () {
      const keys = Object.keys(that.tokenList);
      if (keys.length < that.cacheLen) {
        that.tokenList[token] = data;
      } else {
        that.tokenList[keys[0]] = null;
      }
      const result = yield redis.set(redisKey + token, JSON.stringify(data));
      return result;
    })().catch(error => {
      logger.error(error);
    });
  }

  delete(token) {
    delete this.tokenList[token];
    return redis.del(redisKey + token);
  }

  /**
     * 生成token
     * @param {*} data
     */
  encrypt(data) {
    const that = this;
    return co.wrap(function* () {
      let str = config.encryptStr;
      for (const key in data) {
        str = data[key];
      }
      const token = md5(str);
      yield that._save(token, data);
      return token;
    })().catch(error => {
      logger.error(error);
    });
  }

  /**
     * 解析token的信息
     * @param {*} token
     */
  decrypt(token) {
    const that = this;
    return co.wrap(function* () {
      if (token in that.tokenList) {
        return that.tokenList[token];
      }
      const result = JSON.parse(yield redis.get(redisKey + token));
      return result;
    })().catch(error => {
      logger.error(error);
    });
  }
}
const tokenProvider = new TokenProvider();
module.exports = tokenProvider;
