'use strict';
/**
 * @file 入口文件
 * @author Yourtion Guo <yourtion@gmail.com>
 */
const http = require('http');
const { mysql, redis, log4js, config } = require('./global');
const app = require('./app');
const pjson = require('../package.json');
const initSocket = require('./socket')
const server = http.createServer(app);
initSocket(server)

const PORT = config.port || process.env.PORT || 3001;
const HOST = config.host || process.env.HOST || '127.0.0.1';
server.listen(PORT, HOST, function() {
    // eslint-disable-next-line no-console
    console.log(`${ pjson.name } is listening on ${ HOST }:${ PORT }`);
    process.send && process.send('ready');
});

process.on('uncaughtException', function(err) {
    // eslint-disable-next-line no-console
    console.log('uncaughtException', (err && err.stack) || err);
    process.exit(-1);
});

process.on('unhandledRejection', function(err) {
    // eslint-disable-next-line no-console
    console.error('unhandledRejection', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
    // Clean up other resources like DB connections
    const cleanUp = (cb) => {
        // eslint-disable-next-line no-console
        mysql.end(console.error);
        redis.end();
        log4js.shutdown(cb);
    };

    server.close(() => {
        cleanUp(() => {
            process.exit();
        });
    });

    // Force close server after 5secs
    setTimeout((e) => {
        // eslint-disable-next-line no-console
        console.log('Forcing server close !!!', e);
        cleanUp();
        process.exit(1);
    }, 5000);
});