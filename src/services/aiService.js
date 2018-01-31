const AI = require("../lib/wuzi/ai");
const event = require('../event/index')
const deeping = require('../lib/wuzi/negamax')
const aiList = {}

class AiService {
    constructor(id) {
        // console.log(aiList, aiList[id], "命中")
        let ai = aiList[id]
        if (!aiList[id]) {
            ai = new AI()
            aiList[id] = ai
            ai.start(15)
        }
        this.id = id
        this.ai = ai

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

    restore(chessList, human_type) {
        this.ai.start(15)
        return this.ai.restore(chessList, human_type)
    }

    destroy() {
        delete aiList[this.id]
    }
}

module.exports = AiService