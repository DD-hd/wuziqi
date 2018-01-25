const event = {
    connect: {
        connect: 'connect',
        disconnect: 'disconnect'
    },
    user: {
        come: "come",
        say_one: 'say_to_one',
        say_all: 'say_to_all',
        receipt_me: "receipt_me",
        receipt_all: "receipt_all"
    },
    room: {
        init: "init",
        user_come: 'user_come',
        user_leave: 'user_leave'
    }
}

module.exports = (io, socket) => {
    const user_id = socket.id
    const allUser = io.sockets.connected
    const default_room_id = 0
    socket.join(default_room_id)
    socket.on(event.room.say_one, function(data) {
        console.log('say_one')
        const { msg, to_user_id } = data
        allUser[to_user_id].emit(event.room.receipt_me, { from_id: user_id, msg })
    });

    socket.on(event.user.say_all, function(data) {
        const room_key = Object.keys(socket.rooms)
        const room_id = room_key[0] == user_id ? default_room_id : room_key[0]
        console.log('say_all', socket.rooms, room_id)
        const { msg } = data
        socket.to(room_id).emit(event.user.receipt_all, { msg, from_id: user_id })
    });

    socket.on(event.user.come, function(data) {
        const { room_id } = data
        const room_key = Object.keys(socket.rooms)
        const pre_room_id = room_key[0] == user_id ? default_room_id : room_key[0]
        socket.leave(pre_room_id)
        socket.join(room_id)
        socket.to(room_id).emit(event.room.user_come, { user_id })
    });

    socket.on('disconnect', function() {

        socket.emit(event.room.user_leave, { user_id })
    });
}