const dino = document.getElementById('dino');
const ground = document.getElementById('ground');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOverDisplay = document.getElementById('game-over');
const restartDisplay = document.getElementById('restart');

let isJumping = false;
let isGameOver = false;
let score = 0;
let highScore = 0;
let jumpStartTime = 0;
let jumpHeight = 0;
let currentJumpVelocity = 0;
const MAX_JUMP_HEIGHT = 300;
const MIN_JUMP_HEIGHT = 150;
const JUMP_CHARGE_RATE = 2;
const GRAVITY = 0.5;
const JUMP_POWER = 20;
const MAX_JUMP_DURATION = 1000;
let gameSpeed = 1.5;
let obstacleInterval;

// Game state
let isPlaying = false;

function startGame() {
    // Reset game states
    isPlaying = true;
    isGameOver = false;
    isJumping = false;
    score = 0;
    gameSpeed = 1.5;
    currentJumpVelocity = 0;
    
    // Reset displays
    scoreDisplay.textContent = '0';
    gameOverDisplay.classList.add('hidden');
    restartDisplay.classList.add('hidden');
    
    // Reset dino position and state
    dino.style.bottom = '0px';
    dino.classList.remove('jump');
    dino.classList.add('running');
    
    // Reset ground animation
    const ground = document.getElementById('ground');
    ground.style.animationPlayState = 'running';
    
    // Remove all existing obstacles
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => {
        obstacle.remove();
    });
    
    // Clear all intervals
    if (obstacleInterval) {
        clearInterval(obstacleInterval);
    }
    if (jumpChargeInterval) {
        clearInterval(jumpChargeInterval);
    }
    
    // Start new game
    startObstacleGeneration();
}

function gameOver() {
    isPlaying = false;
    isGameOver = true;
    gameOverDisplay.classList.remove('hidden');
    restartDisplay.classList.remove('hidden');
    dino.classList.remove('running');
    dino.classList.remove('jump');
    
    // Stop all obstacles
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => {
        obstacle.style.animationPlayState = 'paused';
    });
    
    // Stop ground animation
    const ground = document.getElementById('ground');
    ground.style.animationPlayState = 'paused';
    
    // Clear all intervals
    clearInterval(obstacleInterval);
    clearInterval(jumpChargeInterval);
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = `HI: ${highScore}`;
    }
}

function updateJump() {
    if (!isJumping) return;

    // Apply gravity
    currentJumpVelocity -= GRAVITY;
    
    // Update position
    const currentBottom = parseFloat(dino.style.bottom) || 0;
    const newBottom = currentBottom + currentJumpVelocity;
    
    // Ground collision check
    if (newBottom <= 0) {
        dino.style.bottom = '0px';
        isJumping = false;
        currentJumpVelocity = 0;
        dino.classList.remove('jump');
        dino.classList.add('running');
        return;
    }
    
    dino.style.bottom = `${newBottom}px`;
    requestAnimationFrame(updateJump);
}

function jump() {
    if (!isJumping && !isGameOver) {
        isJumping = true;
        jumpStartTime = Date.now();
        dino.classList.remove('running');
        dino.classList.add('jump');
        
        // Calculate initial jump velocity based on space press duration
        const jumpDuration = Date.now() - jumpStartTime;
        const jumpPower = Math.min(JUMP_POWER, JUMP_POWER * 0.5 + (jumpDuration * 0.015));
        currentJumpVelocity = jumpPower;
        
        // Start jump animation
        updateJump();
    }
}

function createObstacle() {
    if (!isPlaying) return;
    
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    // Obstacle types with weighted probability
    const types = ['cactus', 'rock', 'bird'];
    const weights = [0.4, 0.2, 0.4]; // 선인장 40%, 바위 20%, 새 40% 확률로 변경
    let random = Math.random();
    let typeIndex = 0;
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (random < sum) {
            typeIndex = i;
            break;
        }
    }
    
    const type = types[typeIndex];
    obstacle.classList.add(type);
    
    // Add SVG for bird
    if (type === 'bird') {
        obstacle.innerHTML = `
            <svg viewBox="0 0 100 60" width="40" height="24">
                <style>
                    @keyframes wingFlap {
                        0% { transform: scaleY(1) rotate(0deg); }
                        25% { transform: scaleY(0.7) rotate(-5deg); }
                        50% { transform: scaleY(0.5) rotate(-10deg); }
                        75% { transform: scaleY(0.7) rotate(-5deg); }
                        100% { transform: scaleY(1) rotate(0deg); }
                    }
                    @keyframes bodyFloat {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-2); }
                        100% { transform: translateY(0); }
                    }
                    @keyframes headBob {
                        0% { transform: rotate(0deg); }
                        50% { transform: rotate(5deg); }
                        100% { transform: rotate(0deg); }
                    }
                    @keyframes beakPeck {
                        0% { transform: rotate(0deg); }
                        50% { transform: rotate(-10deg); }
                        100% { transform: rotate(0deg); }
                    }
                    .wing { 
                        animation: wingFlap 0.8s infinite;
                        transform-origin: 50% 30%;
                    }
                    .body { 
                        animation: bodyFloat 1s infinite;
                        transform-origin: center;
                    }
                    .head { 
                        animation: headBob 2s infinite;
                        transform-origin: 50% 30%;
                    }
                    .beak { 
                        animation: beakPeck 0.3s infinite;
                        transform-origin: 45% 25%;
                    }
                </style>
                
                <!-- 날개 -->
                <g class="wing">
                    <!-- 위쪽 날개 -->
                    <path d="M20,30 
                           C30,15 40,10 50,30 
                           C60,50 70,45 80,30
                           C70,15 60,10 50,30
                           C40,50 30,45 20,30" 
                          fill="none" stroke="#4a4a4a" stroke-width="2"/>
                    
                    <!-- 날개 장식 -->
                    <path d="M35,25 
                           C40,20 45,20 50,25
                           C45,30 40,30 35,25" 
                          fill="none" stroke="#4a4a4a" stroke-width="1"/>
                </g>
                
                <!-- 몸통 -->
                <g class="body">
                    <path d="M50,30 
                           C55,25 65,25 70,30 
                           C65,35 55,35 50,30" 
                          fill="none" stroke="#4a4a4a" stroke-width="2"/>
                </g>
                
                <!-- 머리와 부리 -->
                <g class="head">
                    <!-- 부리 -->
                    <g class="beak">
                        <path d="M50,30 
                               L45,25 
                               L50,30" 
                              fill="none" stroke="#4a4a4a" stroke-width="2"/>
                    </g>
                    <!-- 눈 -->
                    <circle cx="52" cy="28" r="1" fill="#4a4a4a"/>
                </g>
            </svg>
        `;
        obstacle.style.bottom = '100px'; // 공중에 위치
    } else if (type === 'cactus') {
        obstacle.innerHTML = `
            <svg viewBox="0 0 100 100" width="30" height="100%">
                <!-- 날카로운 가시들 -->
                <path d="M50,0 L55,20 L50,40 L45,20 Z" fill="#2d5a27" stroke="#1a3d17" stroke-width="2"/>
                <path d="M30,30 L35,50 L30,70 L25,50 Z" fill="#2d5a27" stroke="#1a3d17" stroke-width="2"/>
                <path d="M70,30 L75,50 L70,70 L65,50 Z" fill="#2d5a27" stroke="#1a3d17" stroke-width="2"/>
                <!-- 몸통 -->
                <path d="M45,40 L55,40 L55,100 L45,100 Z" fill="#2d5a27" stroke="#1a3d17" stroke-width="2"/>
            </svg>
        `;
    } else if (type === 'rock') {
        obstacle.innerHTML = `
            <svg viewBox="0 0 100 100" width="30" height="100%">
                <!-- 날카로운 바위 -->
                <path d="M20,100 L40,80 L60,90 L80,70 L90,100 Z" fill="#4a4a4a" stroke="#2d2d2d" stroke-width="2"/>
                <path d="M30,90 L50,70 L70,80 L60,100 Z" fill="#3a3a3a" stroke="#2d2d2d" stroke-width="1"/>
                <path d="M40,80 L60,60 L80,70 L70,90 Z" fill="#5a5a5a" stroke="#2d2d2d" stroke-width="1"/>
            </svg>
        `;
    }
    
    ground.appendChild(obstacle);

    // Calculate obstacle height based on type
    const playerHeight = 50;
    const minHeight = 20;
    let maxHeight;
    
    switch(type) {
        case 'bird':
            maxHeight = playerHeight * 0.4; // 새는 플레이어 높이의 40%
            break;
        default:
            maxHeight = playerHeight * 0.8; // 지상 장애물은 플레이어 높이의 80%
    }
    
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    obstacle.style.height = `${height}px`;
    
    if (type !== 'bird') {
        obstacle.style.bottom = '0px'; // 지상 장애물은 바닥에 고정
    }

    // Set animation duration based on type
    const baseDuration = 2.0;
    const typeSpeedModifier = type === 'bird' ? 1.5 : 1.0; // 새는 50% 더 빠르게
    obstacle.style.animationDuration = `${(baseDuration * typeSpeedModifier) / gameSpeed}s`;

    // Check for collision
    const checkCollision = setInterval(() => {
        if (!isPlaying) {
            clearInterval(checkCollision);
            return;
        }

        const dinoRect = dino.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        // Calculate collision box for dino (excluding legs)
        const dinoCollisionBox = {
            left: dinoRect.left + 10,
            right: dinoRect.right - 10,
            top: dinoRect.top + 10,
            bottom: dinoRect.bottom - 20
        };

        // Calculate collision box for obstacle with type-specific adjustments
        const obstacleCollisionBox = {
            left: obstacleRect.left + (type === 'bird' ? 8 : 5),
            right: obstacleRect.right - (type === 'bird' ? 8 : 5),
            top: obstacleRect.top + (type === 'bird' ? 8 : 5),
            bottom: obstacleRect.bottom - (type === 'bird' ? 8 : 5)
        };

        // Improved collision detection with precise boxes
        const collision = (
            dinoCollisionBox.right > obstacleCollisionBox.left &&
            dinoCollisionBox.left < obstacleCollisionBox.right &&
            dinoCollisionBox.bottom > obstacleCollisionBox.top &&
            dinoCollisionBox.top < obstacleCollisionBox.bottom
        );

        if (collision) {
            gameOver();
            clearInterval(checkCollision);
        }
    }, 10);

    // Remove obstacle after animation
    obstacle.addEventListener('animationend', () => {
        obstacle.remove();
        score++;
        scoreDisplay.textContent = score;
        
        // Add score increase animation
        scoreDisplay.classList.add('increase');
        setTimeout(() => {
            scoreDisplay.classList.remove('increase');
        }, 500);
        
        // Increase game speed every 10 points with a maximum limit
        if (score % 10 === 0 && gameSpeed < 2.5) {
            gameSpeed += 0.1;
            scoreDisplay.style.color = '#FF6B6B';
            setTimeout(() => {
                scoreDisplay.style.color = '#535353';
            }, 1000);
        }
    });
}

// Space bar controls
let spacePressed = false;
let jumpChargeInterval;
let jumpDuration = 0;

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (!spacePressed) {
            spacePressed = true;
            if (isGameOver) {
                startGame();
            } else if (!isJumping) {
                jumpStartTime = Date.now();
                jumpChargeInterval = setInterval(() => {
                    const currentTime = Date.now();
                    const chargeTime = currentTime - jumpStartTime;
                    jumpHeight = Math.min(MAX_JUMP_HEIGHT, MIN_JUMP_HEIGHT + (chargeTime * JUMP_CHARGE_RATE));
                    jumpDuration = Math.min(MAX_JUMP_DURATION, chargeTime);
                }, 10);
            }
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        spacePressed = false;
        if (jumpChargeInterval) {
            clearInterval(jumpChargeInterval);
            jumpChargeInterval = null;
        }
        if (!isJumping && !isGameOver) {
            jump();
        }
    }
});

// Start creating obstacles with dynamic interval
function startObstacleGeneration() {
    // Add initial delay before creating first obstacle
    setTimeout(() => {
        if (isPlaying) {
            createObstacle();
        }
    }, 2000);

    // Dynamic interval based on game speed
    const updateInterval = () => {
        if (isPlaying) {
            const baseInterval = 2500; // 기본 간격을 2.5초로 증가
            const speedFactor = Math.max(0.7, 1 - (gameSpeed - 1.5) * 0.1); // 속도에 따른 간격 조정을 더 완만하게
            const interval = baseInterval * speedFactor;
            
            createObstacle();
            obstacleInterval = setTimeout(updateInterval, interval);
        }
    };

    obstacleInterval = setTimeout(updateInterval, 2000);
}

// Initial high score
highScoreDisplay.textContent = 'HI: 0';

// Start game immediately
startGame();
startObstacleGeneration(); 