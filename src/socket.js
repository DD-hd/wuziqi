const { socketCookieParser, store, socketSession, socketHelper } = require('./lib/middlewares')
const roomHandle = require('./handles/roomHandle')

module.exports = (server) => {
    const io = require('socket.io')(server, {
        pingInterval: 1000,
        pingTimeout: 5000,
        cookie: true
    })

    io.use(socketCookieParser());
    // io.use(socketSession)
    io.use(socketHelper)
    let i = 1;
    io.on('connection', function(socket) {
        socketSession(socket, () => {
            roomHandle(io, socket)
        })
    });
}