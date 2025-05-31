const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cat, activeFish, badFish, level, score, speed;
let gravity = 1.5;
let gameOver = false;
let gameWon = false;
let maxLevels = 5;
let jumpStrength = 0;
let levelUpTimer = 0;

// Uudet muuttujat ajanottoon
let startTime = 0;
let endTime = 0;

// Aloitus
function resetGame() {
    cat = { x: 50, y: 350, width: 40, height: 40, vy: 0, grounded: true, direction: 1 };
    level = 1;
    score = 0;
    speed = 2;
    gameOver = false;
    gameWon = false;
    startTime = Date.now(); // Ajanotto alkaa
    endTime = 0;
    spawnBadFish();
    spawnGoodFish();
}

// Spawnaa goodFish
function spawnGoodFish() {
    activeFish = {
        x: Math.random() * (canvas.width - 20),
        y: 60 + Math.random() * (canvas.height - 160)
    };
}

// Spawnaa badFish → YLEMMÄLLE puolikkaalle
function spawnBadFish() {
    badFish = {
        x: Math.random() * (canvas.width - 20),
        y: Math.random() * ((canvas.height / 2) - 20),
        vx: speed * (Math.random() < 0.5 ? 1 : -1),
        vy: (speed * (0.5 + Math.random())) * (Math.random() < 0.5 ? 1 : -1)
    };
}

// Piirtofunktiot
function drawCat() {
    ctx.fillStyle = 'orange';
    ctx.fillRect(cat.x, cat.y, cat.width, cat.height);
}

function drawFish() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(activeFish.x, activeFish.y, 20, 20);
}

function drawBadFish() {
    ctx.fillStyle = 'green';
    ctx.fillRect(badFish.x, badFish.y, 20, 20);
}

function drawCenteredText(text, y, font = '24px Arial') {
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    const x = (canvas.width - textWidth) / 2;
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y);
}

function drawButton() {
    ctx.fillStyle = 'red';
    ctx.fillRect(120, 220, 160, 50);
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    const text = 'PLAY AGAIN';
    const textWidth = ctx.measureText(text).width;
    const textX = 120 + (160 - textWidth) / 2;
    ctx.fillText(text, textX, 250);
}

// Päivitys
function update() {
    if (gameOver || gameWon) return;

    // Liikuta kissaa
    cat.x += speed * cat.direction;
    cat.x = Math.max(0, Math.min(canvas.width - cat.width, cat.x));

    // Hyppy
    if (jumpStrength !== 0 && cat.grounded) {
        cat.vy = jumpStrength;
        cat.grounded = false;
        jumpStrength = 0;
    }

    cat.y += cat.vy;
    cat.vy += gravity;

    if (cat.y + cat.height >= canvas.height) {
        cat.y = canvas.height - cat.height;
        cat.vy = 0;
        cat.grounded = true;
    }

    // Liikuta badFish
    if (badFish) {
        badFish.x += badFish.vx;
        badFish.y += badFish.vy;

        // X-reuna
        if (badFish.x <= 0 || badFish.x >= canvas.width - 20) {
            badFish.vx *= -1;
            badFish.x = Math.max(0, Math.min(canvas.width - 20, badFish.x));
        }

        // Y-reuna
        if (badFish.y <= 0 || badFish.y >= canvas.height - 20) {
            badFish.vy *= -1;
            badFish.y = Math.max(0, Math.min(canvas.height - 20, badFish.y));
        }
    }

    // Tarkista goodFish törmäys
    if (activeFish && collides(cat, activeFish)) {
        score++;

        if (score % 10 === 0) {
            level++;

            // BADFISH katoaa heti kun taso nousee
            badFish = null;

            if (level > maxLevels) {
                gameWon = true;
                endTime = Date.now(); // Ajanotto pysähtyy
                return;
            } else {
                speed += 0.5;
                activeFish = null;
                levelUpTimer = 60;

                // spawn badFish ja goodFish 1 sekunnin päästä
                setTimeout(() => {
                    spawnBadFish();
                    spawnGoodFish();
                }, 1000);

                return;
            }
        }

        spawnGoodFish();
    }

    // Tarkista badFish törmäys
    if (badFish && collides(cat, badFish)) {
        gameOver = true;
    }

    if (levelUpTimer > 0) levelUpTimer--;
}

function collides(a, b) {
    return a.x < b.x + 20 && a.x + a.width > b.x &&
           a.y < b.y + 20 && a.y + a.height > b.y;
}

// Piirto
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCat();

    if (activeFish) {
        drawFish();
    }

    if (badFish) {
        drawBadFish();
    }

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 20);

    if (gameWon) {
        let totalTime = (endTime - startTime) / 1000;
        ctx.fillText('TIME: ' + totalTime.toFixed(2) + ' s', 10, 40);
    } else {
        ctx.fillText('Level: ' + level, 10, 40);
    }

    if (levelUpTimer > 0) {
        drawCenteredText('LEVEL UP!', 50, '24px Arial');
    }

    // GAME OVER tai WELL PLAYED näkymä
    if (gameOver || gameWon) {
        const title = gameOver ? 'GAME OVER' : 'WELL PLAYED';
        drawCenteredText(title, 120, '32px Arial');

        let totalTime = ((gameWon ? endTime : Date.now()) - startTime) / 1000;

        drawCenteredText('Score: ' + score, 170, '20px Arial');
        drawCenteredText('Level: ' + level, 200, '20px Arial');
        drawCenteredText('Time: ' + totalTime.toFixed(2) + ' s', 230, '20px Arial');

        drawButton();
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Kontrollit
document.getElementById('leftBtn').addEventListener('click', () => cat.direction = -1);
document.getElementById('rightBtn').addEventListener('click', () => cat.direction = 1);
document.getElementById('jumpLowBtn').addEventListener('click', () => jumpStrength = -14);
document.getElementById('jumpMedBtn').addEventListener('click', () => jumpStrength = -20);
document.getElementById('jumpHighBtn').addEventListener('click', () => jumpStrength = -30);

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') cat.direction = -1;
    if (e.key === 'ArrowRight') cat.direction = 1;
    if (e.key === '1') jumpStrength = -14;
    if (e.key === '2') jumpStrength = -20;
    if (e.key === '3') jumpStrength = -30;

    // Restart Space-napista
    if ((gameOver || gameWon) && e.code === 'Space') {
        resetGame();
    }
});

// Restart-napin käsittely
canvas.addEventListener('click', function(e) {
    if ((gameOver || gameWon) &&
        e.offsetX >= 120 && e.offsetX <= 280 &&
        e.offsetY >= 220 && e.offsetY <= 270) {
        resetGame();
    }
});

// Käynnistys
resetGame();
loop();
