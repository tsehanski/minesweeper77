window.addEventListener("contextmenu", e => e.preventDefault());
const EMPTY = ''
const FLAG = '🏴'
const MINE = '💣'
    //
var gBoard
var gGameInterval
var gNumOfFlags
var firstClick
var gNumOfLives
var gNumOfHints

var gLevel = { SIZE: 4, MINES: 2 };

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function init() {
    gNumOfHints = 3
    gNumOfLives = 3
    firstClick = false
    gGame.isOn = true
    gBoard = createMat(gLevel.SIZE)
    gNumOfFlags = gLevel.MINES
    addMines(gBoard, gLevel.MINES)
    setNegsCount(gBoard)
    renderBoard(gBoard, '.board')
}

function addMines(board, count) {
    for (var i = 0; i < count; i++) {
        var randIdxI = getRandomIntInclusive(0, board.length - 1)
        var randIdxJ = getRandomIntInclusive(0, board.length - 1)
        if (board[randIdxI][randIdxJ].isMine) {
            i--
            continue
        } else {
            board[randIdxI][randIdxJ] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: true,
                isMarked: false,
            }

        }
    }
}

function cellClicked(cellI, cellJ) {
    var currCell = gBoard[cellI][cellJ]
    if (gGame.isOn) {
        if (!firstClick) {
            setTime()
            firstClick = true
            checkNegs(cellI, cellJ)
            currCell.isShown = true
        } else if (!currCell.isMine) {
            checkNegs(cellI, cellJ)
            currCell.isShown = true
        } else {
            gNumOfLives--
            gGame.markedCount++
                currCell.isShown = true
            if (gNumOfLives === 0) {
                gameOver()
            }
        }
        gGame.shownCount = countShown()
        renderBoard(gBoard, '.board')
        checkWin()
    }

}

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    var elCellsShown = document.querySelector('span.shown')
    var elLives = document.querySelector('span.lives')
        // var elHints = document.querySelector('span.hints')
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = `cell-${i}-${j}`
            if (cell.isMine && cell.isShown) {
                cell = MINE
                className = 'mine'
            } else if (cell.isShown) {
                cell = cell.minesAroundCount
                className = 'shown'
            } else if (cell.isMarked) {
                cell = FLAG
            } else {
                cell = EMPTY
            }
            strHTML += `<td oncontextmenu="placeFlag(${i},${j})"  onclick="cellClicked(${i},${j})" class="${className}">${cell}</td>`
        }
        // onclick = "getHint(${i},${j})"
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
    elCellsShown.innerText = countShown()
    elLives.innerText = createHearts()
        // elHints.innerText = createHints()
}

function setMinesNegsCount(board, cellI, cellJ) {
    if (board[cellI][cellJ].isMine) return
    var minesCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var currCell = board[i][j]
            if (currCell.isMine) {
                minesCount++
            }

        }
    }
    if (minesCount === 0) {
        minesCount = ''
    }
    board[cellI][cellJ] = { minesAroundCount: minesCount, isShown: false, isMine: false, isMarked: false }
}

// function getHint(i, j) {
//     var randomCell = getRandomIntInclusive(0, gBoard[i][j])
//     if (gNumOfHints <= 3) {
//         var currHint = gBoard[i][j].isShown = true
//         renderBoard(gBoard, '.board')
//         setInterval(() => {
//             var elHints = document.querySelector('button.hint')
//             elHints.style.backgrounColor = rgb(255, 255, 255);
//             currHint += randomCell


//         }, 1000);
//         gNumOfHints--
//     }
//     if (gNumOfHints === 0) return
// }

function placeFlag(i, j) {
    if (gNumOfFlags > 0) {
        gBoard[i][j].isMarked = true
        renderBoard(gBoard, '.board')
            // gNumOfFlags--
        gGame.markedCount++
            checkWin()
    }
}

function showAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine) {
                currCell.isShown = true
            }
        }
    }

}

function setNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            setMinesNegsCount(board, i, j)
        }
    }
}


function checkWin() {
    var numberOfCells = gLevel.SIZE * gLevel.SIZE
    var size = numberOfCells - gLevel.MINES
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (gLevel.MINES === 2) {
                if (currCell.isMine === 2) {
                    gameOver()
                }
            }
            if (size === gGame.shownCount || size < gGame.shownCount) {
                win()
            }
            if (currCell.isMine) {
                livesCount--
            }
            if (livesCount === 0)
                showAllMines()
            gameOver()

        }
    }

}


function reset() {
    var elModal = document.querySelector('.modal')
    var elSmily = document.querySelector('button.reset')
    var elTimer = document.querySelector('span.time')
    var elCellsShown = document.querySelector('span.shown')
    clearInterval(gGameInterval)
    elSmily.innerText = '😀'
    elTimer.innerText = '0'
    elCellsShown.innerText = countShown()
    elModal.classList.add('hide')
    init()
}

function setTime() {
    gGame.secsPassed = Date.now()
    gGameInterval = setInterval(function() {
        var elTimer = document.querySelector('span.time')
        var miliSecs = Date.now() - gGame.secsPassed
        elTimer.innerText = ((miliSecs) / 1000).toFixed(1)
    }, 10)
}

function countShown() {
    var counter = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            currCell = gBoard[i][j]
            if (currCell.isShown) {
                counter++
            }
        }
    }
    return counter
}

function checkNegs(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            var currCell = gBoard[i][j]
            if (!currCell.isMine) {
                currCell.isShown = true
            }
        }
    }
}