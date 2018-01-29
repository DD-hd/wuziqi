const AI = require("../lib/wuzi/ai");
const event = require('../event/index')
const aiList = {}

module.exports = function(id, e) {
    let data = null
    let ai = aiList[id]
    if (!aiList[id]) {
        ai = new AI();
        aiList[id] = ai
    }
    if (e.type == event.wuzi.start) {
        ai.start(15);
    } else if (e.type == event.wuzi.go) {
        var p = ai.set(e.data.x, e.data.y);
        data = p
    } else if (e.type == event.wuzi.back) {
        ai.back();
    } else if (e.type == event.wuzi.finish) {
        delete aiList[id]
    }
    return data
}