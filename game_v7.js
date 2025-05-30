
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cat = { x: 50, y: 350, width: 40, height: 40, vy: 0, grounded: true, direction: 1 };
let baseSpeed = 2;
let speed = baseSpeed;
let level = 1;
let maxLevels = 5;
let score = 0;

let activeFish = null;
let lastFishPos = { x: 0, y: 0 };
let badFishes = [];
let gravity = 1.5;
let gameOver = false;
let gameWon = false;

let jumpStrength = 0;
let levelUpTimer = 0;

// Äänet
const jumpSound = new Audio('jump.wav');
const collectSound = new Audio('collect.wav');
const levelupSound = new Audio('levelup.wav');

function getSafeYPosition(minY = 60, maxY = canvas.height - 100) {
    return minY + Math.random() * (maxY - minY);
}

function isTooClose(fish, others) {
    for (let o of others) {
        const dx = fish.x - o.x;
        const dy = fish.y - o.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 30) return true;
    }
    return false;
}

function spawnBadFishes() {
    badFishes = [];
    let tries = 0;
    while (badFishes.length < 2 && tries < 100) {
        let bf = { x: Math.random() * (canvas.width - 20), y: getSafeYPosition(200, canvas.height - 100) };
        if (!isTooClose(bf, badFishes)) {
            badFishes.push(bf);
        }
        tries++;
    }
}

function spawnNewGoodFish() {
    let tries = 0;
    do {
        activeFish = { x: Math.random() * (canvas.width - 20), y: getSafeYPosition(60, canvas.height - 100) };
        tries++;
    } while (
        (isTooClose(activeFish, badFishes) ||
        badFishes.some(bf => activeFish.y < bf.y + 20) ||
        Math.abs(activeFish.x - lastFishPos.x) < 40 ||
        Math.abs(activeFish.y - lastFishPos.y) < 40) && tries < 100
    );

    // Päivitetään viimeisin paikka
    lastFishPos = { x: activeFish.x, y: activeFish.y };
}

function resetGame() {
    score = 0;
    level = 1;
    speed = baseSpeed;
    cat = { x: 50, y: 350, width: 40, height: 40, vy: 0, grounded: true, direction: 1 };
    gameOver = false;
    gameWon = false;
    spawnBadFishes();
    spawnNewGoodFish();
}

function drawCat() {
    ctx.fillStyle = 'orange';
    ctx.fillRect(cat.x, cat.y, cat.width, cat.height);
}

function drawFish() {
    if (activeFish) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(activeFish.x, activeFish.y, 20, 20);
    }
}

function drawBadFishes() {
    for (let bf of badFishes) {
        ctx.fillStyle = 'green';
        ctx.fillRect(bf.x, bf.y, 20, 20);
    }
}

function drawText(text, x = 100, y = 180) {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(text, x, y);
}

function drawButton() {
    ctx.fillStyle = 'red';
    ctx.fillRect(120, 220, 160, 50);
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText('Restart', 160, 250);
}

canvas.addEventListener('click', function(e) {
    if ((gameOver || gameWon) &&
        e.offsetX >= 120 && e.offsetX <= 280 &&
        e.offsetY >= 220 && e.offsetY <= 270) {
        resetGame();
    }
});

function update() {
    if (gameOver || gameWon) return;

    cat.x += speed * cat.direction;

    if (cat.x < 0) cat.x = 0;
    if (cat.x + cat.width > canvas.width) cat.x = canvas.width - cat.width;

    if (jumpStrength !== 0 && cat.grounded) {
        cat.vy = jumpStrength;
        cat.grounded = false;
        jumpStrength = 0;
        jumpSound.play();
    }

    cat.y += cat.vy;
    cat.vy += gravity;

    if (cat.y + cat.height >= canvas.height) {
        cat.y = canvas.height - cat.height;
        cat.vy = 0;
        cat.grounded = true;
    }

    if (activeFish &&
        cat.x < activeFish.x + 20 && cat.x + cat.width > activeFish.x &&
        cat.y < activeFish.y + 20 && cat.y + cat.height > activeFish.y) {
        score++;
        collectSound.play();

        if (score % 10 === 0) {
            level++;
            if (level > maxLevels) {
                gameWon = true;
                return;
            } else {
                speed += 0.5;
                spawnBadFishes();
                spawnNewGoodFish();
                levelUpTimer = 120;
                levelupSound.play();
                return;
            }
        } else {
            spawnNewGoodFish();
        }
    }

    for (let bf of badFishes) {
        if (cat.x < bf.x + 20 && cat.x + cat.width > bf.x &&
            cat.y < bf.y + 20 && cat.y + cat.height > bf.y) {
            gameOver = true;
        }
    }

    if (levelUpTimer > 0) levelUpTimer--;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCat();
    drawFish();
    drawBadFishes();

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Level: ' + level, 10, 40);

    if (levelUpTimer > 0) {
        drawText('LEVEL UP!', canvas.width - 150, 30);
    }

    if (gameOver) {
        drawText('GAME OVER');
        drawButton();
    }

    if (gameWon) {
        drawText('WELL PLAYED');
        drawButton();
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

document.getElementById('leftBtn').addEventListener('touchstart', () => cat.direction = -1);
document.getElementById('rightBtn').addEventListener('touchstart', () => cat.direction = 1);
document.getElementById('jumpLowBtn').addEventListener('touchstart', () => jumpStrength = -14);
document.getElementById('jumpMedBtn').addEventListener('touchstart', () => jumpStrength = -20);
document.getElementById('jumpHighBtn').addEventListener('touchstart', () => jumpStrength = -30);

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') cat.direction = -1;
    if (e.key === 'ArrowRight') cat.direction = 1;
    if (e.key === '1') jumpStrength = -14;
    if (e.key === '2') jumpStrength = -20;
    if (e.key === '3') jumpStrength = -30;
});

resetGame();
loop();
