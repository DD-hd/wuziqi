const { socketCookieParser, store, authSocket, getSession } = require('./lib/middlewares')
const roomHandle = require('./handles/roomHandle')

module.exports = (server) => {
    const io = require('socket.io')(server, {
        pingInterval: 1000,
        pingTimeout: 5000,
        cookie: true
    })
    io.use(socketCookieParser());
    io.use(authSocket)
    io.on('connection', function(socket) {
        // store.get(socket.request.cookies['connect.sid'], (err) => {
        //     console.log(err)
        // })
        // socket.use((packet, next) => {
        //     console.log(packet)
        //     console.log("123")
        //     socket.disconnect(true)
        //     if (packet.doge === true) return next();
        //     next(new Error('Not a doge error'));
        // });

        // console.log('cookies', getSession(socket.request).then((res) => {
        //     console.log(res)
        // }))
        roomHandle(io, socket)
    });
}