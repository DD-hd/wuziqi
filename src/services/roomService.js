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
            const [belong_user_id, custom_user_id] = yield redis.zrange(that._getRuuningRoomKey(room_id), 0, -1)
            return [belong_user_id, custom_user_id]
        })
    }

    /**
     * 存储房间信息
     */
    putRunningRoomInfo(room_id, user_id) {
        return redis.zadd(this._getRuuningRoomKey(room_id), new Date().getTime(), user_id)
    }



    /**
     * 获取房间id
     */
    getRoomId() {
        return utils.randomString(6) + utils.getDateString(2, new Date())
    }

    /**
     * 获取用户id
     */
    getUserId() {
        return utils.randomString(6) + utils.getDateString(2, new Date()) + 123
    }

    /**
     * 下棋
     * @param {*} room_id 
     * @param {*} x 
     * @param {*} y 
     * @param {*} role 
     */
    putChess(room_id, x, y, role) {
        return redis.zadd(this._getChessKey(room_id), new Date().getTime(), x + this.gap + y + this.gap + role)
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
        return redis.zrem(this._getChessKey(room_id), data)
    }

    /**
     * 获得棋谱
     * @param {*} room_id 
     */
    getChessList(room_id, human_type) {
        const that = this
        return co(function*() {
            const list = yield redis.zrange(that._getChessKey(room_id), 0, -1)
            const comList = []
            const humanList = []

            return list && list.map(item => {
                const [x, y, role] = item.split(that.gap)
                return { x: Number(x), y: Number(y), role }
            })
        })
    }

    /**
     * 获取谁应该下棋
     */
    getShouldPlayRole(room_id, user_id) {
        const that = this
        return co(function*() {
            const room_users = yield redis.zrange(that._getRuuningRoomKey(room_id), 0, 1)
            const chessList = yield redis.zrevrange(that._getChessKey(room_id), 0, 1)
            const belong_user = room_users[0]
            const lastChess = chessList.length && chessList[chessList.length - 1]
            if (!lastChess) {
                return user_id == belong_user ? 0 : 1
            } else {
                const [x, y, role] = lastChess.split(that.gap)
                return Number(role) == 0 ? 1 : 0
            }

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