// const bridgeConnect = require('../services/bridgeService')
// const event = require('../event/index')

// module.exports = (io, socket) => {
//     const user_id = socket.id
//     const allUser = io.sockets.connected
//     const default_room_id = 0
//     socket.on(event.wuzi.start, function(data) {
//         // console.log(data, socket)
//         bridgeConnect(user_id, { type: event.wuzi.start })
//     })

//     socket.on(event.wuzi.go, function(data) {
//         const { x, y } = data
//         console.log(data)
//         const p = bridgeConnect(user_id, { type: event.wuzi.go, data: { x, y } })
//         socket.emit(event.wuzi.go, p)
//     })

//     socket.on(event.wuzi.back, function(data) {
//         bridgeConnect(user_id, { type: event.wuzi.back })
//     })

//     socket.on(event.wuzi.finish, function(data) {
//         bridgeConnect(user_id, { type: event.wuzi.finish })
//     })

// }