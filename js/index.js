"use strict"

console.log("Welcome to my chess board!")

const CHESS_COLOR_RED = "red";
const CHESS_COLOR_GREEN = "green";

let lbMouse = document.getElementById("mouse-position");
const iconCircle = document.getElementById('icon-circle');
const iconCircleWin = document.getElementById('icon-circle-win');
const iconRemove = document.getElementById('icon-remove');
const iconRemoveWin = document.getElementById('icon-remove-win');
const btnClearChess = document.getElementById("clear-chess");
const lbChessTurn = document.getElementById("lb-chess-turn");
const displayTimer = document.getElementById("timer-count-down");
const displayWinner = document.getElementById("display-winner");

let whoIsClick = CHESS_COLOR_GREEN;
let listOfChessPoints = [];
let redChess = []
let greenChess = []
const checkerBox = { width: 20, height: 20 }
let matrixBoard = [];
const oneMinutes = 10;
let winner = null;
let listPointWin = [];
let isStartGame = 1;

// start timer
let interval;
// Timer count down
function timerCountDown(duration, displayTimer) {
    clearInterval(interval);
    var start = Date.now(),
        diff,
        minutes,
        seconds;
    function timer() {
        if (diff == 0) {
            alert("Time up! " + getWinner().toLocaleUpperCase() + ' is winner')
            winner = getWinner();
            displayWinner.innerText = `${getWinner().toLocaleUpperCase()} is winner`;
            clearInterval(interval);
            return;
        }
        diff = duration - (((Date.now() - start) / 1000) | 0);

        // does the same job as parseInt truncates the float
        minutes = (diff / 60) | 0;
        seconds = (diff % 60) | 0;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        displayTimer.textContent = minutes + ":" + seconds; 

        if (diff <= 0) {
            // add one second so that the count down starts at the full duration
            // example 05:00 not 04:59
            start = Date.now() + 1000;
        }
    };
    timer();
    interval = setInterval(timer, 1000);
}

function getTurn() {
    return (whoIsClick == CHESS_COLOR_GREEN) ? CHESS_COLOR_RED : CHESS_COLOR_GREEN;
}

function getWinner() {
    return whoIsClick;
}

function startGame() {
    btnClearChess.innerText = "Restart game";
    informTurnChess(getTurn());
    timerCountDown(oneMinutes, displayTimer);
}

function Board(width, height) {
    this.width = width;
    this.height = height;
    this.chartBoard = [];

    for (var i = 0; i < this.width; i++) {
        const row = [];
        this.chartBoard.push(row);
        for (var j = 0; j < this.height; j++) {
            const col = {};
            row.push(col);
        }
    }
}

Board.prototype.drawBoard = function () {
    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.strokeRect(j * 20, i * 20, 20, 20);
            ctx.closePath();
        }
    }
};

Board.prototype.clear = function () {
    window.location.reload();
    listOfChessPoints = [];
    redChess = [];
    greenChess = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function writeMessage(message) {
    lbMouse.innerHTML = message;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getCheckerBoxPos(params) {
    let { x, y, width, height } = params;
    return {
        x: Math.floor(x / width),
        y: Math.floor(y / height)
    };
}

function informTurnChess(whoIsClick) {
    lbChessTurn.innerHTML = whoIsClick.toLocaleUpperCase();
    lbChessTurn.style.color = whoIsClick;
}

function isExist(listOfChessPoints, xSearch, ySearch) {
    return listOfChessPoints.find(chess => chess.x == xSearch && chess.y == ySearch)
}

function drawCheckerBox({ x, y }) {
    if (winner !== null) {
        clearInterval(interval);
        return;
    }

    if (isExist(listOfChessPoints, x, y) !== undefined) return;

    let typeOfChess = whoIsClick == CHESS_COLOR_RED ? CHESS_COLOR_GREEN : CHESS_COLOR_RED
    listOfChessPoints = [...listOfChessPoints, { x, y, typeOfChess }]
    matrixBoard[x][y] = { x, y, typeOfChess }

    let X = x * checkerBox.width
    let Y = y * checkerBox.height
    informTurnChess(whoIsClick)
    if (whoIsClick == CHESS_COLOR_RED) {
        greenChess = [...greenChess, { x, y }]
        ctx.drawImage(iconCircle, X, Y, checkerBox.width, checkerBox.height);
        whoIsClick = CHESS_COLOR_GREEN

    } else {
        redChess = [...redChess, { x, y }]
        ctx.drawImage(iconRemove, X, Y, checkerBox.width, checkerBox.height);
        whoIsClick = CHESS_COLOR_RED
    }

    timerCountDown(oneMinutes, displayTimer)

    if (isEndGame({ x, y }, whoIsClick)) {
        alert(`End game! ${getWinner().toLocaleUpperCase()} is winner`);
        winner = getWinner();
        displayWinner.innerText = `${getWinner().toLocaleUpperCase()} is winner`;
        clearInterval(interval);
        return;
    }
}

function drawWinnerLine(listPointWin) {
    listPointWin.forEach(point => {
        let X = point.x * checkerBox.width;
        let Y = point.y * checkerBox.height;
        let iconWin = whoIsClick == CHESS_COLOR_RED ? iconRemoveWin : iconCircleWin;
        ctx.drawImage(iconWin, X, Y, checkerBox.width, checkerBox.height);
    });
}

function isEndGame(chessPoint, whoIsClick) {
    return (
        isWinHorizontal(chessPoint, whoIsClick)
        || isWinMainDiagonal(chessPoint, whoIsClick)
        || isWinSecondaryDiagonal(chessPoint, whoIsClick)
        || isWinVertical(chessPoint, whoIsClick)
    )
}

function isWinHorizontal(chessPoint, whoIsClick) {
    let countLeft = 0;
    let countRight = 0;
    listPointWin = [];
    // count left
    for (let i = chessPoint.x; i >= 0; i--) {
        if (i < 0) { break; }

        if (whoIsClick == matrixBoard[i][chessPoint.y].typeOfChess) {
            countLeft++;
            listPointWin = [...listPointWin, matrixBoard[i][chessPoint.y]];
        } else { break; }
    }

    // count right
    for (let i = chessPoint.x + 1; i <= matrixBoard.length - 1; i++) {
        if (i > matrixBoard.length - 1) { break; }

        if (whoIsClick == matrixBoard[i][chessPoint.y].typeOfChess) {
            countRight++;
            listPointWin = [...listPointWin, matrixBoard[i][chessPoint.y]];
        } else { break; }
    }

    if (countLeft + countRight == 5) {
        drawWinnerLine(listPointWin)
    }
    return countLeft + countRight == 5
}

function isWinVertical(chessPoint, whoIsClick) {
    let countTop = 0;
    let countBottom = 0;
    listPointWin = [];
    // cout top
    for (let i = chessPoint.y; i >= 0; i--) {
        if (i < 0) { break; }

        if (whoIsClick == matrixBoard[chessPoint.x][i].typeOfChess) {
            countTop++;
            listPointWin = [...listPointWin, matrixBoard[chessPoint.x][i]]
        } else { break; }
    }

    // count bottom
    for (let i = chessPoint.y + 1; i <= matrixBoard.length - 1; i++) {
        if (i > matrixBoard.length - 1) { break; }

        if (whoIsClick == matrixBoard[chessPoint.x][i].typeOfChess) {
            countBottom++;
            listPointWin = [...listPointWin, matrixBoard[chessPoint.x][i]]
        } else { break; }
    }
    if (countTop + countBottom == 5) {
        drawWinnerLine(listPointWin)
    }
    return countTop + countBottom == 5
}

function isWinMainDiagonal(chessPoint, whoIsClick) {
    let countTop = 0;
    let countBottom = 0;
    listPointWin = [];
    // cout top
    for (let i = chessPoint.x; i >= 0; i--) {
        if (chessPoint.y - countTop < 0) {
            break;
        }
        if (whoIsClick == matrixBoard[i][chessPoint.y - countTop].typeOfChess) {
            listPointWin = [...listPointWin, matrixBoard[i][chessPoint.y - countTop]];
            countTop++;
        } else { break; }
    }

    // count bottom
    for (let i = chessPoint.x + 1; i <= matrixBoard.length - 1; i++) {
        if (chessPoint.y + countBottom + 1 > matrixBoard.length - 1) { break; }

        if (whoIsClick == matrixBoard[i][chessPoint.y + countBottom + 1].typeOfChess) {
            listPointWin = [...listPointWin, matrixBoard[i][chessPoint.y + countBottom + 1]];
            countBottom++;
        } else { break; }
    }

    if (countTop + countBottom == 5) {
        drawWinnerLine(listPointWin)
    }

    return countTop + countBottom == 5
}

function isWinSecondaryDiagonal(chessPoint, whoIsClick) {
    let countTop = 0;
    let countBottom = 0;
    listPointWin = [];
    // cout top
    for (let i = chessPoint.x; i >= 0; i--) {
        if (chessPoint.y + countTop > matrixBoard.length - 1) {
            break;
        }
        if (whoIsClick == matrixBoard[i][chessPoint.y + countTop].typeOfChess) {
            listPointWin = [...listPointWin, matrixBoard[i][chessPoint.y + countTop]];
            countTop++;
        } else { break; }
    }

    // count bottom
    for (let i = chessPoint.x + 1; i <= matrixBoard.length - 1; i++) {
        if (chessPoint.y - (countBottom + 1) < 0) { break; }

        if (whoIsClick == matrixBoard[i][chessPoint.y - (countBottom + 1)].typeOfChess) {
            listPointWin = [...listPointWin, matrixBoard[i][chessPoint.y - (countBottom + 1)]];
            countBottom++;
        } else { break; }
    }

    if (countTop + countBottom == 5) {
        drawWinnerLine(listPointWin)
    }

    return countTop + countBottom == 5
}

let board = new Board(40, 40);

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

board.drawBoard();
matrixBoard = board.chartBoard;
canvas.addEventListener('click', function (evt) {
    var mousePos = getMousePos(canvas, evt);
    let params = { x: mousePos.x, y: mousePos.y, width: 20, height: 20 };
    var checkerBoxPos = getCheckerBoxPos(params)
    writeMessage(`Mouse position: ${checkerBoxPos.x}, ${checkerBoxPos.y}`);
    drawCheckerBox({ x: checkerBoxPos.x, y: checkerBoxPos.y })
}, false);

btnClearChess.addEventListener("click", () => {
    if (isStartGame) {
        board.drawBoard();
        startGame();
        isStartGame = 0;
    } else {
        board.clear();
    }
})