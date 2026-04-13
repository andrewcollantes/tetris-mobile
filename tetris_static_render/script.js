const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("nextPiece");
const nextCtx = nextCanvas.getContext("2d");

const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverText = document.getElementById("gameOverText");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const downBtn = document.getElementById("downBtn");
const rotateBtn = document.getElementById("rotateBtn");
const dropBtn = document.getElementById("dropBtn");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const COLORS = [
    null,
    "#00f7ff",
    "#ffe600",
    "#9d4dff",
    "#39ff14",
    "#ff3131",
    "#2d7cff",
    "#ff9f1c"
];

const SHAPES = [
    [],
    [[1, 1, 1, 1]],
    [
        [2, 2],
        [2, 2]
    ],
    [
        [0, 3, 0],
        [3, 3, 3]
    ],
    [
        [0, 4, 4],
        [4, 4, 0]
    ],
    [
        [5, 5, 0],
        [0, 5, 5]
    ],
    [
        [6, 0, 0],
        [6, 6, 6]
    ],
    [
        [0, 0, 7],
        [7, 7, 7]
    ]
];

let board = [];
let score = 0;
let lines = 0;
let level = 1;
let nextMatrix = null;

let dropInterval = 400;
let dropCounter = 0;
let lastTime = 0;
let animationId = null;
let isGameRunning = false;
let isGameOver = false;

let player = {
    pos: { x: 0, y: 0 },
    matrix: null
};

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
    const pieceId = Math.floor(Math.random() * 7) + 1;
    return SHAPES[pieceId].map(row => [...row]);
}

function resetPlayer() {
    if (!nextMatrix) {
        player.matrix = randomPiece();
        nextMatrix = randomPiece();
    } else {
        player.matrix = nextMatrix;
        nextMatrix = randomPiece();
    }

    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);

    drawNextPiece();

    if (collide(board, player)) {
        gameOver();
    }
}

function drawCell(x, y, value) {
    const color = COLORS[value];
    if (!color) return;

    const px = x * BLOCK_SIZE;
    const py = y * BLOCK_SIZE;

    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
    ctx.restore();
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawCell(x + offset.x, y + offset.y, value);
            }
        });
    });
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!nextMatrix) return;

    const previewBlockSize = 24;
    const matrixWidth = nextMatrix[0].length;
    const matrixHeight = nextMatrix.length;

    const offsetX = Math.floor((nextCanvas.width - matrixWidth * previewBlockSize) / 2);
    const offsetY = Math.floor((nextCanvas.height - matrixHeight * previewBlockSize) / 2);

    nextMatrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const px = offsetX + x * previewBlockSize;
                const py = offsetY + y * previewBlockSize;

                nextCtx.save();
                nextCtx.shadowBlur = 12;
                nextCtx.shadowColor = COLORS[value];
                nextCtx.fillStyle = COLORS[value];
                nextCtx.fillRect(px + 1, py + 1, previewBlockSize - 2, previewBlockSize - 2);

                nextCtx.strokeStyle = "#ffffff";
                nextCtx.lineWidth = 1;
                nextCtx.strokeRect(px + 2, py + 2, previewBlockSize - 4, previewBlockSize - 4);
                nextCtx.restore();
            }
        });
    });
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = "rgba(0, 247, 255, 0.12)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
    ctx.restore();

    drawMatrix(board, { x: 0, y: 0 });

    if (player.matrix) {
        drawMatrix(player.matrix, player.pos);
    }
}

function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(board, player) {
    const matrix = player.matrix;
    const pos = player.pos;

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (
                matrix[y][x] !== 0 &&
                (
                    board[y + pos.y] === undefined ||
                    board[y + pos.y][x + pos.x] === undefined ||
                    board[y + pos.y][x + pos.x] !== 0
                )
            ) {
                return true;
            }
        }
    }
    return false;
}

function rotate(matrix) {
    return matrix[0].map((_, index) =>
        matrix.map(row => row[index]).reverse()
    );
}

function playerRotate() {
    const originalMatrix = player.matrix.map(row => [...row]);
    const originalX = player.pos.x;

    player.matrix = rotate(player.matrix);

    let offset = 1;
    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (Math.abs(offset) > player.matrix[0].length) {
            player.matrix = originalMatrix;
            player.pos.x = originalX;
            return;
        }
    }
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(board, player)) {
        player.pos.x -= dir;
    }
}

function playerDrop() {
    player.pos.y++;

    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        clearLines();
        resetPlayer();
    }

    dropCounter = 0;
}

function hardDrop() {
    while (!collide(board, player)) {
        player.pos.y++;
    }

    player.pos.y--;
    merge(board, player);
    clearLines();
    resetPlayer();
    dropCounter = 0;
}

function clearLines() {
    let cleared = 0;

    outer:
    for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        cleared++;
        y++;
    }

    if (cleared > 0) {
        lines += cleared;
        score += getLineScore(cleared, level);
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 400 - (level - 1) * 30);
        updateScore();
    }
}

function getLineScore(lineCount, level) {
    const points = {
        1: 100,
        2: 300,
        3: 500,
        4: 800
    };

    return (points[lineCount] || 0) * level;
}

function updateScore() {
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
}

function update(time = 0) {
    if (!isGameRunning || isGameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }

    drawBoard();
    animationId = requestAnimationFrame(update);
}

function startGame() {
    board = createBoard();
    score = 0;
    lines = 0;
    level = 1;
    nextMatrix = null;
    dropInterval = 400;
    dropCounter = 0;
    lastTime = 0;
    isGameOver = false;
    isGameRunning = true;

    gameOverText.classList.add("hidden");

    updateScore();
    resetPlayer();
    drawBoard();

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    update();
}

function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    gameOverText.classList.remove("hidden");
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

function ensureGameStarted() {
    if (!isGameRunning && !isGameOver) {
        startGame();
        return true;
    }
    return false;
}

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    const controlKeys = ["a", "d", "s", "w", "arrowleft", "arrowright", "arrowdown", "arrowup"];

    if (!isGameRunning) {
        if (controlKeys.includes(key) || event.code === "Space") {
            startGame();
            return;
        }
    }

    if (isGameOver) return;

    if (key === "a" || key === "arrowleft") {
        playerMove(-1);
    } else if (key === "d" || key === "arrowright") {
        playerMove(1);
    } else if (key === "s" || key === "arrowdown") {
        playerDrop();
    } else if (key === "w" || key === "arrowup") {
        playerRotate();
    } else if (event.code === "Space") {
        event.preventDefault();
        hardDrop();
    }

    drawBoard();
});

function bindTouchButton(button, action) {
    if (!button) return;

    const handler = (e) => {
        e.preventDefault();

        if (isGameOver) return;

        const justStarted = ensureGameStarted();
        if (justStarted) return;

        action();
        drawBoard();
    };

    button.addEventListener("touchstart", handler, { passive: false });
    button.addEventListener("click", handler);
}

bindTouchButton(leftBtn, () => playerMove(-1));
bindTouchButton(rightBtn, () => playerMove(1));
bindTouchButton(downBtn, () => playerDrop());
bindTouchButton(rotateBtn, () => playerRotate());
bindTouchButton(dropBtn, () => hardDrop());

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

board = createBoard();
drawBoard();
updateScore();
drawNextPiece();
