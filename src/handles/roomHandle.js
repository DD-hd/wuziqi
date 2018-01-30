const event = require('../event/index')
const roomService = require('../services/roomService')
const AiService = require('../services/aiService')
const { co } = require('../global/index')

function getRoomInfoByType(type) {
    return co(function*() {
        if (type == 'human') {
            return roomService.getRandAloneRoomInfo()
        }
        const user_id = roomService.getUserId() + "000"
        const room_id = roomService.getRoomId() + "000"
        return roomService.putRunningRoomInfo(room_id, user_id)
    })

}

module.exports = (io, socket) => {
    socket.on(event.wuzi.init, (data) => {
        co(function*() {
            const { type } = data
            if (socket.request.$user) { //恢复
                const { room_id, user_id } = socket.request.$user
                const chessList = yield roomService.getChessList()
                const [belong_user_id, custom_user_id] = roomService.getRunningRoomInfo(room_id)
                const other_user_id = belong_user_id === user_id ? custom_user_id : belong_user_id
                if (chessList && belong_user_id && custom_user_id) {
                    if (type === "computer") {
                        const aiService = new AiService(room_id)
                        aiService.restore(chessList)
                    }
                    return socket.emit(event.wuzi.restore, { status: "restore", data: { user_id, other_user_id, chessList } })
                }
            }


            const user_id = roomService.getUserId()
            const make_room_id = roomService.getRoomId()
            const room_info = yield getRoomInfoByType(type)
            const room_id = room_info ? room_info[0] : make_room_id
            if (!room_info) {
                yield roomService.putAloneRoomInfo(make_room_id, socket_id)
            }
            const status = room_info ? "start" : "waiting"
            const other_user_id = room_info ? room_info[1] : null
            const role = room_info ? 1 : 0


            yield roomService.putRunningRoomInfo(room_id, user_id)

            const room_ids = Object.keys(socket.rooms).filter(room_id => room_id !== socket.id)
            room_ids.forEach(room_id => {
                socket.leave(room_id)
            })
            socket.join(room_id)
            socket.emit(event.wuzi.init, { status, data: { user_id, other_user_id } })
            socket.request.$user = {
                room_id: make_room_id,
                user_id,
                role,
                type
            }
            if (room_info) {
                socket.to(room_id).emit(event.wuzi.other_come, { other_user_id: user_id })
            }
        })
    })

    // socket.on(event.wuzi.start, (data) => {
    //     // console.log(data, socket)
    //     const { room_id, role } = socket.request.$user
    //     bridgeConnect(user_id, { type: event.wuzi.start })
    // })

    socket.on(event.wuzi.go, (data) => {
        co(function*() {
            const { room_id, role, type } = socket.request.$user
            const { x, y } = data
            yield roomService.putChess(room_id, x, y, role)
            if (type == "computer") {
                const aiService = new AiService(room_id)
                const p = aiService.go(x, y)
                yield roomService.putChess(room_id, p.x, p.y, !role)
                return socket.emit(event.wuzi.go, p)
            }
            return socket.to(room_id).emit(event.wuzi.go, data)
        })


    })

    socket.on(event.wuzi.back, (data) => {
        co(function*() {
            const { room_id, role, type } = socket.request.$user
            const { x, y } = data
            yield roomService.backChess(room_id, x, y, role)
            if (type == "computer") {
                const aiService = new AiService(room_id)
                const p = aiService.back()
                yield roomService.backChess(room_id, p.x, p.y, !role)
            }
            socket.to(room_id).emit(event.wuzi.back, data)
        })
    })

    socket.on(event.wuzi.finish, function(data) {
        const { room_id, role, type } = socket.request.$user
        yield roomService.removeChessList(room_id)
        yield roomService.removeRunningRoom(room_id)
    })

}