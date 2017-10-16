'use strict';

const nodemailer = require('nodemailer');
const { log4js, config, redis, coroutine, errors, utils } = require('../global');
const logger = log4js.getLogger();
const conf = config.smtp;

const poolConfig = {
  pool: true,
  host: conf.host,
  port: conf.port || 465,
  secure: conf.tls === undefined ? false : conf.secure,
  auth: {
    user: conf.user,
    pass: conf.password,
  },
};

const transporter = nodemailer.createTransport(poolConfig);

transporter.verify().then((success) => {
  return logger.debug('nodemailer test: ', success);
}).catch(err => {
  logger.error(err);
});

const defaultOption = {
  from: `"${ conf.name }" <${ conf.user }>`,
};

module.exports.sendMail = (toMail, subject, content, html = false) => {
  const user = Array.isArray(toMail) ? toMail.join(',') : toMail;
  const option = {
    to: user,
    subject,
  };
  if(html) {
    option.html = content;
  } else {
    option.text = content;
  }
  const mailOptions = Object.assign(option, defaultOption);
  logger.trace(mailOptions);
  return transporter.sendMail(mailOptions);
};

// module.exports.sendMail('Yourtion@gmail.com', 'hello', 'hello world').then(console.log).catch(console.error);
