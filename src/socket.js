const { socketCookieParser, store, socketSession, socketHelper } = require('./lib/middlewares')
const roomHandle = require('./handles/roomHandle')
const wrapSocket = require('./lib/wrapSocket')

module.exports = (server) => {
    const io = require('socket.io')(server, {
        pingInterval: 1000,
        pingTimeout: 5000,
        cookie: true
    })
    wrapSocket(io)
    io.use(socketCookieParser());
    io.use(socketSession)
    io.use(socketHelper)
    io.on('connection', function(socket) {
        wrapSocket(socket)
        socketSession(socket, () => {
            roomHandle(io, socket)
        })
        socket.on("errorHandle", (err) => {
            console.log("socket:errorHandle", err)
        })
    });

    io.on("errorHandle", (err) => {
        console.log("io:errorHandle", err)
    })
}