const event = {
    basic: {
        connect: 'connect',
        disconnect: 'disconnect',
        fail: "fail",
        success: "success"
    },

    wuzi: {
        init: "init",
        restore: "restore",
        other_come: "self_ready",
        computer: {
            start: "computer:start",
            go: "computer:go",
            back: "computer:back",
            finish: "computer:finish"
        },
        human: {
            start: "human:start",
            go: "human:go",
            back: "human:back",
            finish: "human:finish"
        }
    }
}

module.exports = event