const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let direction = 'right';
let score = 0;
let gameOver = false;
let gameLoop;

const loginContainer = document.getElementById('login-container');
const gameContainer = document.getElementById('game-container');
const rankingContainer = document.getElementById('ranking-container');
const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('login-btn');
const scoreDisplay = document.getElementById('score');
const rankingList = document.getElementById('ranking-list');
const playAgainBtn = document.getElementById('play-again-btn');

let user = null;

loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value;
    if (username) {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });
            user = await response.json();
            loginContainer.style.display = 'none';
            gameContainer.style.display = 'block';
            startGame();
        } catch (error) {
            console.error('Login failed:', error);
        }
    }
});

playAgainBtn.addEventListener('click', () => {
    rankingContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    startGame();
});

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? 'green' : 'lime';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function update() {
    if (gameOver) {
        endGame();
        return;
    }

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    if (head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize || checkCollision(head)) {
        gameOver = true;
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

function checkCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
});

function startGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    gameOver = false;
    scoreDisplay.textContent = `Score: ${score}`;
    generateFood();
    gameLoop = setInterval(update, 100);
}

async function endGame() {
    clearInterval(gameLoop);
    try {
        await fetch('/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id, score }),
        });
        showRanking();
    } catch (error) {
        console.error('Failed to save score:', error);
    }
}

async function showRanking() {
    try {
        const response = await fetch('/ranking');
        const ranking = await response.json();
        rankingList.innerHTML = '';
        ranking.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.username}: ${item.score}`;
            rankingList.appendChild(li);
        });
        gameContainer.style.display = 'none';
        rankingContainer.style.display = 'block';
    } catch (error) {
        console.error('Failed to fetch ranking:', error);
    }
}
