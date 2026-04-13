const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");

const COLS = 10;
const ROWS = 20;
const SIZE = 30;

canvas.width = COLS * SIZE;
canvas.height = ROWS * SIZE;

/* ✅ NEW HIGH CONTRAST COLORS */
const COLORS = [
    null,
    "#123524",
    "#1f4d36",
    "#2b6b4a",
    "#347a53",
    "#3d8a5d",
    "#24513a",
    "#4a9b68"
];

const SHAPES = [
    [],
    [[1,1,1,1]],
    [[2,2],[2,2]],
    [[0,3,0],[3,3,3]],
    [[0,4,4],[4,4,0]],
    [[5,5,0],[0,5,5]],
    [[6,0,0],[6,6,6]],
    [[0,0,7],[7,7,7]]
];

let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));

let player = {
    pos:{x:0,y:0},
    matrix:null
};

function drawCell(x,y,value){
    if(!value) return;

    ctx.fillStyle = COLORS[value];
    ctx.fillRect(x*SIZE,y*SIZE,SIZE,SIZE);

    /* clearer edges */
    ctx.strokeStyle="rgba(255,255,255,0.2)";
    ctx.strokeRect(x*SIZE,y*SIZE,SIZE,SIZE);
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    board.forEach((row,y)=>{
        row.forEach((v,x)=> drawCell(x,y,v));
    });

    if(player.matrix){
        player.matrix.forEach((row,y)=>{
            row.forEach((v,x)=>{
                drawCell(x+player.pos.x,y+player.pos.y,v);
            });
        });
    }
}

function randomPiece(){
    return SHAPES[Math.floor(Math.random()*7)+1];
}

function reset(){
    player.matrix=randomPiece();
    player.pos.y=0;
    player.pos.x=3;
}

function update(){
    draw();
    requestAnimationFrame(update);
}

reset();
update();
