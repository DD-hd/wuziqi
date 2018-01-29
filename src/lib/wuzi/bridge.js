var AI = require("./ai.js");
var ai = new AI();

module.exports = function(e, callback) {
    if (e.type == "START") {
        ai.start(15);
    } else if (e.type == "GO") {
        var p = ai.set(e.data.x, e.data.y);
        callback(p);
    } else if (e.type == "BACK") {
        ai.back();
    }
}