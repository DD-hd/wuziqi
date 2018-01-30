const { redis, utils, co } = require('../global')
class RoomService {
    constructor() {
        this.aloneRoomKey = "alone:room"
        this.runningRoomKey = "running:room"
        this.gap = "###"
        this.chessKey = "chessKey"
    }
    _getChessKey(room_id) {
        return this.chessKey + ":" + room_id
    }
    _getRuuningRoomKey(room_id) {
        return this.runningRoomKey + ":" + room_id
    }

    /**
     * 获得单独房间信息
     */
    getRandAloneRoomInfo() {
        const that = this
        return co(function*() {
            const room_info = yield redis.spop(that.aloneRoomKey)
            return room_info && room_info.split(that.gap)
        })
    }

    /**
     * 存储单独房间信息
     * @param {*} room_id 
     * @param {*} user_id 
     */
    putAloneRoomInfo(room_id, user_id) {
        return redis.sadd(this.aloneRoomKey, room_id + this.gap + user_id)
    }

    /**
     * 获得房间信息
     */
    getRunningRoomInfo(room_id) {
        const that = this
        return co(function*() {
            const [belong_user_id, custom_user_id] = yield redis.zrange(this._getRuuningRoomKey(room_id), 0, -1)
            return [belong_user_id, custom_user_id]
        })
    }

    /**
     * 存储房间信息
     */
    putRunningRoomInfo(room_id, user_id) {
        return redis.zadd(this._getRuuningRoomKey(room_id), user_id, new Date().getTime())
    }



    /**
     * 获取房间id
     */
    getRoomId() {
        return utils.getDateString(2, new Date())
    }

    /**
     * 获取用户id
     */
    getUserId() {
        return utils.getDateString(2, new Date()) + 123
    }

    /**
     * 下棋
     * @param {*} room_id 
     * @param {*} x 
     * @param {*} y 
     * @param {*} role 
     */
    putChess(room_id, x, y, role) {
        return redis.sadd(this._getChessKey(room_id), x + this.gap + y + this.gap + role)
    }

    /**
     * 悔棋
     * @param {*} room_id 
     * @param {*} x 
     * @param {*} y 
     * @param {*} role 
     */
    backChess(room_id, x, y, role) {
        const data = x + this.gap + y + this.gap + role
        return redis.srem(this._getChessKey(room_id), data)
    }

    /**
     * 获得棋谱
     * @param {*} room_id 
     */
    getChessList(room_id) {
        return co(function*() {
            const list = yield redis.smembers(this._getChessKey(room_id))
            conole.log(list)
            return list && list.map(item => {
                const [x, y, role] = item.split(this.gap)
                return { x, y, role }
            })
        })
    }

    /**
     * 移除棋谱
     * @param {*} room_id 
     */
    removeChessList(room_id) {
        return redis.del(this._getChessKey(room_id))
    }

    /**
     * 移除正在下棋的房间
     */
    removeRunningRoom(room_id) {
        return redis.zrem(this._getRuuningRoomKey(), room_id)
    }
}

module.exports = new RoomService()