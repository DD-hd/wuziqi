/*
 * 启发式评价函数
 * 这个是专门给某一个空位打分的，不是给整个棋盘打分的
 * 并且是只给某一个角色打分
 */
var R = require("./role.js");
var type = require("./count-to-type.js");
var typeToScore = require("./type-to-score.js");
/*
 * 表示在当前位置下一个棋子后的分数
 */

var s = function(board, p, role) {
    var result = 0;
    var count = 0,
        block = 0,
        secondCount = 0; //另一个方向的count

    var len = board.length;

    function reset() {
        count = 1;
        block = 0;
        empty = -1;
        secondCount = 0; //另一个方向的count
    }


    reset();

    for (var i = p[1] + 1; true; i++) {
        if (i >= len) {
            block++;
            break;
        }
        var t = board[p[0]][i];
        if (t === R.empty) {
            if (empty == -1 && i < len - 1 && board[p[0]][i + 1] == role) {
                empty = count;
                continue;
            } else {
                break;
            }
        }
        if (t === role) {
            count++;
            continue;
        } else {
            block++;
            break;
        }
    }


    for (var i = p[1] - 1; true; i--) {
        if (i < 0) {
            block++;
            break;
        }
        var t = board[p[0]][i];
        if (t === R.empty) {
            if (empty == -1 && i > 0 && board[p[0]][i - 1] == role) {
                empty = 0; //注意这里是0，因为是从右往左走的
                continue;
            } else {
                break;
            }
        }
        if (t === role) {
            secondCount++;
            empty !== -1 && empty++; //注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
            continue;
        } else {
            block++;
            break;
        }
    }

    count += secondCount;


    result += type(count, block, empty);

    //纵向
    reset();

    for (var i = p[0] + 1; true; i++) {
        if (i >= len) {
            block++;
            break;
        }
        var t = board[i][p[1]];
        if (t === R.empty) {
            if (empty == -1 && i < len - 1 && board[i + 1][p[1]] == role) {
                empty = count;
                continue;
            } else {
                break;
            }
        }
        if (t === role) {
            count++;
            continue;
        } else {
            block++;
            break;
        }
    }

    for (var i = p[0] - 1; true; i--) {
        if (i < 0) {
            block++;
            break;
        }
        var t = board[i][p[1]];
        if (t === R.empty) {
            if (empty == -1 && i > 0 && board[i - 1][p[1]] == role) {
                empty = 0;
                continue;
            } else {
                break;
            }
        }
        if (t === role) {
            secondCount++;
            empty !== -1 && empty++; //注意这里，如果左边又多了己方棋子，那么empty的位置就变大了 ###可能有问题
            continue;
        } else {
            block++;
            break;
        }
    }

    count += secondCount;
    result += type(count, block, empty);


    // \\
    reset();

    for (var i = 1; true; i++) {
        var x = p[0] + i,
            y = p[1] + i;
        if (x >= len || y >= len) {
            block++;
            break;
        }
        var t = board[x][y];
        if (t === R.empty) {
            if (empty == -1 && (x < len - 1 && y < len - 1) && board[x + 1][y + 1] == role) {
                empty = count;
                continue;
            } else {
                break;
            }
        }
        if (t === role) {
            count++;
            continue;
        } else {
            block++;
            break;
        }
    }

    for (var i = 1; true; i++) {
        var x = p[0] - i,
            y = p[1] - i;
        if (x < 0 || y < 0) {
            block++;
            break;
        }
        var t = board[x][y];
        if (t === R.empty) {
            if (empty == -1 && (x > 0 && y > 0) && board[x - 1][y - 1] == role) {
                empty = 0;
                continue;
            } else {
                break;
            }
        }
        if (t === role) {
            secondCount++;
            empty !== -1 && empty++; //注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
            continue;
        } else {
            block++;
            break;
        }
    }

    count += secondCount;
    result += type(count, block, empty);


    // \/
    reset();

    for (var i = 1; true; i++) {
        var x = p[0] + i,
            y = p[1] - i;
        if (x < 0 || y < 0 || x >= len || y >= len) {
            block++;
            break;
        }
        var t = board[x][y];
        if (t === R.empty) {
            if (empty == -1 && (x < len - 1 && y < len - 1) && board[x + 1][y - 1] == role) {
                empty = count;
                continue;
            } else {
                break;
            }
        }
        if (t === role) {
            count++;
            continue;
        } else {
            block++;
            break;
        }
    }

    for (var i = 1; true; i++) {
        var x = p[0] - i,
            y = p[1] + i;
        if (x < 0 || y < 0 || x >= len || y >= len) {
            block++;
            break;
        }
        var t = board[x][y];
        if (t === R.empty) {
            if (empty == -1 && (x > 0 && y > 0) && board[x - 1][y + 1] == role) {
                empty = 0;
                continue;
            } else {
                break;
            }
        }
        if (t === role) {
            secondCount++;
            empty !== -1 && empty++; //注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
            continue;
        } else {
            block++;
            break;
        }
    }

    count += secondCount;
    result += type(count, block, empty);


    return typeToScore(result);
}

module.exports = s;