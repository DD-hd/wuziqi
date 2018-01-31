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
        yield roomService.putRunningRoomInfo(room_id, user_id)
        return [room_id, user_id]
    })

}

module.exports = (io, socket) => {

    if (socket.request.session.$user) {
        const { room_id, user_id, role } = socket.request.session.$user
        socket.join(room_id)
    }
    socket.on(event.wuzi.init, (data) => {
        co(function*() {
            const { type } = data

            if (socket.request.session.$user) { //恢复
                const { room_id, user_id, role } = socket.request.session.$user
                const chessList = yield roomService.getChessList(room_id, role)
                const [belong_user_id, custom_user_id] = yield roomService.getRunningRoomInfo(room_id)
                const other_user_id = belong_user_id === user_id ? custom_user_id : belong_user_id
                if (chessList.length > 0 && belong_user_id && custom_user_id) {
                    if (type === "computer") {
                        const aiService = new AiService(room_id)
                        aiService.restore(chessList, role)
                    }
                    socket.join(room_id)
                    const should_play_role = yield roomService.getShouldPlayRole(room_id, user_id)
                    return socket.emit(event.wuzi.restore, { status: "restore", data: { user_id, other_user_id, chessList, player: role, should_play_role } })
                }
            }


            const user_id = roomService.getUserId()
            const make_room_id = roomService.getRoomId()
            const room_info = yield getRoomInfoByType(type)
            const room_id = room_info ? room_info[0] : make_room_id
            if (!room_info) {
                yield roomService.putAloneRoomInfo(make_room_id, user_id)
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
            const should_play_role = yield roomService.getShouldPlayRole(room_id, user_id)
            socket.emit(event.wuzi.init, { role, status, should_play_role })
            socket.request.session.$user = {
                room_id,
                user_id,
                role,
                type
            }
            socket.request.session.save()
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
            const { room_id, role, type } = socket.request.session.$user
            const { x, y } = data
            yield roomService.putChess(room_id, x, y, role)
            if (type == "computer") {
                const aiService = new AiService(room_id)
                const p = aiService.go(x, y)
                yield roomService.putChess(room_id, p[0], p[1], Number(!role))
                return socket.emit(event.wuzi.go, p)
            }
            return socket.to(room_id).emit(event.wuzi.go, [x, y])
        })


    })

    socket.on(event.wuzi.back, (data) => {
        co(function*() {
            const { room_id, role, type } = socket.request.session.$user
            const { x, y } = data
            yield roomService.backChess(room_id, x, y, role)
            if (type == "computer") {
                const aiService = new AiService(room_id)
                const p = aiService.back()
                yield roomService.backChess(room_id, p[0], p[1], Number(!role))
            }
            socket.to(room_id).emit(event.wuzi.back, data)
        })
    })

    socket.on(event.wuzi.finish, (data) => {
        co(function*() {
            if (socket.request.session.$user) {
                const { room_id, role, type } = socket.request.session.$user
                yield roomService.removeChessList(room_id)
                yield roomService.removeRunningRoom(room_id)
                if (type == "computer") {
                    const aiService = new AiService(room_id)
                    aiService.destroy()
                }
            }

            socket.request.session.$user = {}
            socket.request.session.save()
        })
    })

}