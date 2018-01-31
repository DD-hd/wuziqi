// var S = require("./score.js");
// var R = require("./role.js");
// var W = require("./win.js");

var Board = function(container, status) {
    this.container = container;
    this.status = status;
    this.step = this.container.width() * 0.065;
    this.offset = this.container.width() * 0.044;
    this.steps = []; //存储
    this.domain = "http://127.0.0.1:3001"
    this.started = false;
    this.role = 1;
    this.roleMsg = "电脑"
    this.prePutTime = new Date().getTime()
    var self = this;
    this.container.on("click", function(e) {
        if (self.lock || !self.started) return;
        var y = e.offsetX,
            x = e.offsetY;
        x = Math.floor((x + self.offset) / self.step) - 1;
        y = Math.floor((y + self.offset) / self.step) - 1;

        self.set(x, y, self.role);
    });

    // this.worker = new Worker("./dist/bridge.js?r=" + (+new Date()));
    // this.worker.onmessage = function(e) {
    //     self._set(e.data[0], e.data[1], R.com);
    //     self.lock = false;
    //     self.setStatus("电脑下子(" + e.data[0] + "," + e.data[1] + "), 用时" + ((new Date() - self.time) / 1000) + "秒");
    // }
    this.io = io(this.domain);
    this.io.on("error", function(error) {
        console.log("服务端错误", error)
    })
    this.io.on(EVENT.wuzi.go, function(data) {
        const type = self.role == R.com ? R.hum : R.com
        self._set(data[0], data[1], type);
        self.lock = false;
        self.setStatus(self.roleMsg + "下子(" + data[0] + "," + data[1] + "), 用时" + ((new Date().getTime() - self.prePutTime) / 1000) + "秒");
    })

    this.io.on(EVENT.wuzi.restore, function(result) {
        var chessList = result.data.chessList
        var player = result.data.player
        var should_play_role = result.data.should_play_role
        for (var p of chessList) {
            const { x, y, role } = p
            const type = role == 1 ? R.com : R.hum
            const myRole = player == 1 ? R.com : R.hum
            self.role = myRole
            self._set(x, y, type);
            if (should_play_role == player) {
                self.lock = false;
                self.setStatus("欢迎加入五子棋游戏");
            } else {
                self.setStatus("等待其他人下棋")
            }
        }
    })

    this.setStatus("请点击开始按钮");

}

Board.prototype.start = function() {

    if (this.started) {
        alert("你已经开始游戏")
        return;
    }
    this.initBoard();

    // this.board[7][7] = R.com;
    // this.steps.push([7, 7]);

    // this.draw();

    this.setStatus("欢迎加入五子棋游戏");

    this.started = true;
    this.io.emit(EVENT.wuzi.init, { type: "computer" });
}

Board.prototype.humanStart = function() {
    if (this.started) {
        alert("你已经开始游戏")
        return;
    }
    var self = this
    this.initBoard();

    this.started = true;
    this.roleMsg = "其他人"
    this.io.emit(EVENT.wuzi.init, { type: "human" });
    this.io.on(EVENT.wuzi.init, (data) => {
        const { role, status } = data
        self.role = role == 1 ? R.com : R.hum
        if (status == "start") {
            this.lock = false
            this.setStatus("欢迎加入五子棋游戏")
        }
    })
    this.lock = true
    this.setStatus("等待其他人加入");
    this.io.on(EVENT.wuzi.other_come, (data) => {
        this.lock = false
        this.setStatus("欢迎加入五子棋游戏")
    })
}

Board.prototype.stop = function() {
    if (!this.started) return;
    this.setStatus("请点击开始按钮");
    this.started = false;
    this.io.emit(EVENT.wuzi.finish)
}
Board.prototype.initBoard = function() {
    this.board = [];
    for (var i = 0; i < 15; i++) {
        var row = [];
        for (var j = 0; j < 15; j++) {
            row.push(0);
        }
        this.board.push(row);
    }
    this.steps = [];
}

Board.prototype.draw = function() {
    var container = this.container;
    var board = this.board;

    container.find(".chessman, .indicator").remove();

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j] != 0) {
                var chessman = $("<div class='chessman'></div>").appendTo(container);
                if (board[i][j] == 2) chessman.addClass("black");
                chessman.css("top", this.offset + i * this.step);
                chessman.css("left", this.offset + j * this.step);
            }
        }
    }

    if (this.steps.length > 0) {
        var lastStep = this.steps[this.steps.length - 1];
        $("<div class='indicator'></div>")
            .appendTo(container)
            .css("top", this.offset + this.step * lastStep[0])
            .css("left", this.offset + this.step * lastStep[1])
    }

}

Board.prototype._set = function(x, y, role) {
    this.board[x][y] = role;
    this.steps.push([x, y]);
    this.draw();
    var winner = W(this.board);
    var self = this;
    if (winner == R.com || winner == R.hum) {
        this.io.emit(EVENT.wuzi.finish)
        if (winner != self.role) {
            $.alert(this.roleMsg + "赢了！", function() {
                self.stop();
            });
        } else if (winner == self.role) {
            $.alert("恭喜你赢了！", function() {
                self.stop();
            });
        }
    }




    return winner
}

Board.prototype.set = function(x, y, role) {
    // console.log(x, y, role)
    if (this.board[x][y] !== 0) {
        throw new Error("此位置不为空");
    }
    this.prePutTime = new Date().getTime()

    // console.log(x, y, role)
    this.com(x, y, role);
    var winner = this._set(x, y, role);


}

Board.prototype.com = function(x, y, role) {
    this.lock = true;
    this.time = new Date();
    this.io.emit(EVENT.wuzi.go, {
        x: x,
        y: y
    });
    this.setStatus(this.roleMsg + "正在思考，请稍等..");
}

Board.prototype.setStatus = function(s) {
    this.status.text(s);
}

Board.prototype.back = function(step) {
    if (this.lock) {
        this.setStatus(this.roleMsg + "正在思考，请稍等..");
        return;
    }
    step = step || 1;
    var humanS = null
    while (step && this.steps.length >= 2) {
        var s = this.steps.pop();
        this.board[s[0]][s[1]] = R.empty;
        s = this.steps.pop();
        humanS = s;
        this.board[s[0]][s[1]] = R.empty;
        step--;
    }
    this.draw();
    if (humanS) {
        this.io.emit(EVENT.wuzi.back, { x: humanS[0], y: humanS[1] });
    }

}


var b = new Board($("#board"), $(".status"));
$("#start").click(function() {
    b.start();
});

$("#human").click(function() {
    b.humanStart();
});

$("#fail").click(function() {
    $.confirm("确定认输吗?", function() {
        b.stop();
    });
});

$("#back").click(function() {
    b.back();
});