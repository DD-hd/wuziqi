const { co, utils } = require('../global')

module.exports = (socket) => {
    const old_on = socket.on.bind(socket)
    let errorHandle = () => {}
    socket.on = (...arr) => {
        const errorEvent = "errorHandle"
        const [event_type, func] = arr
        if (event_type === errorEvent) {
            errorHandle = func
            return;
        }
        old_on(event_type, (...arg) => {
            co(function*() {
                if (!utils.isGenerator(func)) {
                    return func(...arg)
                }
                yield co(func, ...arg)
            }).catch(err => {
                errorHandle(err, socket)
            })
        })
    }
}