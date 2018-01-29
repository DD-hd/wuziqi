var score = require("./score.js");

var t = function(count, block, empty) {

    if (empty === undefined) empty = 0;

    //没有空位
    if (empty <= 0) {
        if (count >= 5) return score.FIVE;
        if (block === 0) {
            switch (count) {
                case 1:
                    return score.ONE;
                case 2:
                    return score.TWO;
                case 3:
                    return score.THREE;
                case 4:
                    return score.FOUR;
            }
        }

        if (block === 1) {
            switch (count) {
                case 1:
                    return score.BLOCKED_ONE;
                case 2:
                    return score.BLOCKED_TWO;
                case 3:
                    return score.BLOCKED_THREE;
                case 4:
                    return score.BLOCKED_FOUR;
            }
        }

    } else if (empty === 1 || empty == count - 1) {
        //第1个是空位
        if (count >= 6) {
            return score.FIVE;
        }
        if (block === 0) {
            switch (count) {
                case 2:
                    return score.TWO / 2;
                case 3:
                    return score.THREE;
                case 4:
                    return score.BLOCKED_FOUR;
                case 5:
                    return score.FOUR;
            }
        }

        if (block === 1) {
            switch (count) {
                case 2:
                    return score.BLOCKED_TWO;
                case 3:
                    return score.BLOCKED_THREE;
                case 4:
                    return score.BLOCKED_FOUR;
                case 5:
                    return score.BLOCKED_FOUR;
            }
        }
    } else if (empty === 2 || empty == count - 2) {
        //第二个是空位
        if (count >= 7) {
            return score.FIVE;
        }
        if (block === 0) {
            switch (count) {
                case 3:
                    return score.THREE;
                case 4:
                case 5:
                    return score.BLOCKED_FOUR;
                case 6:
                    return score.FOUR;
            }
        }

        if (block === 1) {
            switch (count) {
                case 3:
                    return score.BLOCKED_THREE;
                case 4:
                    return score.BLOCKED_FOUR;
                case 5:
                    return score.BLOCKED_FOUR;
                case 6:
                    return score.FOUR;
            }
        }

        if (block === 2) {
            switch (count) {
                case 4:
                case 5:
                case 6:
                    return score.BLOCKED_FOUR;
            }
        }
    } else if (empty === 3 || empty == count - 3) {
        if (count >= 8) {
            return score.FIVE;
        }
        if (block === 0) {
            switch (count) {
                case 4:
                case 5:
                    return score.THREE;
                case 6:
                    return score.BLOCKED_FOUR;
                case 7:
                    return score.FOUR;
            }
        }

        if (block === 1) {
            switch (count) {
                case 4:
                case 5:
                case 6:
                    return score.BLOCKED_FOUR;
                case 7:
                    return score.FOUR;
            }
        }

        if (block === 2) {
            switch (count) {
                case 4:
                case 5:
                case 6:
                case 7:
                    return score.BLOCKED_FOUR;
            }
        }
    } else if (empty === 4 || empty == count - 4) {
        if (count >= 9) {
            return score.FIVE;
        }
        if (block === 0) {
            switch (count) {
                case 5:
                case 6:
                case 7:
                case 8:
                    return score.FOUR;
            }
        }

        if (block === 1) {
            switch (count) {
                case 4:
                case 5:
                case 6:
                case 7:
                    return score.BLOCKED_FOUR;
                case 8:
                    return score.FOUR;
            }
        }

        if (block === 2) {
            switch (count) {
                case 5:
                case 6:
                case 7:
                case 8:
                    return score.BLOCKED_FOUR;
            }
        }
    } else if (empty === 5 || empty == count - 5) { //本身已经达到五个
        return score.FIVE;
    }

    return 0;
}

module.exports = t;