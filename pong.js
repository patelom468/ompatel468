const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 12;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 6;
const BALL_SPEED = 6;

// Game state
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = (Math.random() * 2 - 1) * BALL_SPEED;

// Scores (optional)
let playerScore = 0;
let aiScore = 0;

// Mouse control
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;

    // Keep paddle within canvas
    if (playerY < 0) playerY = 0;
    if (playerY + PADDLE_HEIGHT > canvas.height) playerY = canvas.height - PADDLE_HEIGHT;
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 20);
        ctx.stroke();
    }
}

function drawScore() {
    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(playerScore, canvas.width / 4, 50);
    ctx.fillText(aiScore, 3 * canvas.width / 4, 50);
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = (Math.random() * 2 - 1) * BALL_SPEED;
}

function updateBall() {
    ballX += ballVelX;
    ballY += ballVelY;

    // Top and bottom wall collision
    if (ballY - BALL_RADIUS < 0) {
        ballY = BALL_RADIUS;
        ballVelY = -ballVelY;
    }
    if (ballY + BALL_RADIUS > canvas.height) {
        ballY = canvas.height - BALL_RADIUS;
        ballVelY = -ballVelY;
    }

    // Left paddle collision
    if (
        ballX - BALL_RADIUS < PLAYER_X + PADDLE_WIDTH &&
        ballY > playerY &&
        ballY < playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
        ballVelX = -ballVelX;

        // Add a bit of "spin" based on where the ball hits the paddle
        let collidePoint = (ballY - (playerY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        let angleRad = collidePoint * Math.PI / 4; // max 45deg
        let direction = ballVelX > 0 ? 1 : -1;
        ballVelX = direction * BALL_SPEED * Math.cos(angleRad);
        ballVelY = BALL_SPEED * Math.sin(angleRad);
    }

    // Right paddle collision (AI)
    if (
        ballX + BALL_RADIUS > AI_X &&
        ballY > aiY &&
        ballY < aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_RADIUS;
        ballVelX = -ballVelX;

        let collidePoint = (ballY - (aiY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        let angleRad = collidePoint * Math.PI / 4;
        let direction = ballVelX > 0 ? 1 : -1;
        ballVelX = direction * BALL_SPEED * Math.cos(angleRad);
        ballVelY = BALL_SPEED * Math.sin(angleRad);
    }

    // Left/right wall: scoring
    if (ballX < 0) {
        aiScore++;
        resetBall();
    } else if (ballX > canvas.width) {
        playerScore++;
        resetBall();
    }
}

function updateAI() {
    // Simple AI: move towards the ball
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (ballY < aiCenter - 20) {
        aiY -= PADDLE_SPEED;
    } else if (ballY > aiCenter + 20) {
        aiY += PADDLE_SPEED;
    }
    // Keep AI paddle within canvas
    if (aiY < 0) aiY = 0;
    if (aiY + PADDLE_HEIGHT > canvas.height) aiY = canvas.height - PADDLE_HEIGHT;
}

function draw() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, '#111');

    // Draw net
    drawNet();

    // Draw paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');

    // Draw ball
    drawCircle(ballX, ballY, BALL_RADIUS, '#fff');

    // Draw scores
    drawScore();
}

function gameLoop() {
    updateBall();
    updateAI();
    draw();
    requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();
