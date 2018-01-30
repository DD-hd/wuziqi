var initOperation = require("./negamax.js");
var R = require("./role.js");
var zobrist = require("./zobrist.js");
var config = require("./config.js");
var Board = require("./board.js");

var AI = function() {
    this.steps = [];
    this.board = new Board()
}

AI.prototype.start = function(size) {
    this.board.init(size);
}

AI.prototype.set = function(x, y) {
    this.board.put([x, y], R.hum, true);
    var m = initOperation(this.board)
    var p = m(config.searchDeep, this.board);
    this.board.put(p, R.com, true);
    return p;
}

AI.prototype.back = function() {
    return this.board.back();
}

AI.prototype.restore = function(comList, humList) {
    for (let comP of comList) {
        const { x, y } = comP
        this.board.put([x, y], R.com)
    }

    for (let humP of humList) {
        const { x, y } = comP
        this.board.put([x, y], R.hum)
    }

}

module.exports = AI;