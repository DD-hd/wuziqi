const AI = require("../lib/wuzi/ai");
const event = require('../event/index')
const deeping = require('../lib/wuzi/negamax')
const aiList = {}

class AiService {
    constructor(id) {
        let ai = aiList[id]
        if (!aiList[id]) {
            ai = new AI()
        }
        this.ai = ai
    }
    start() {
        this.ai.start(15);
    }
    go(x, y) {
        var p = this.ai.set(x, y);
        return p
    }
    back() {
        return this.ai.back();
    }
    finish() {
        delete aiList[id]
    }
    restore(chessList) {
        return this.ai.restore(comList, humList)
    }
}

module.exports = AiService