const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let gameOver = false;
let passedObstacle = false;

function jump() {
  if (gameOver) return;

  if (!player.classList.contains("jump")) {
    player.classList.add("jump");

    setTimeout(() => {
      player.classList.remove("jump");
    }, 600);
  }
}

function checkCollision() {
  if (gameOver) return;

  const playerRect = player.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  const isColliding =
    playerRect.left < obstacleRect.right &&
    playerRect.right > obstacleRect.left &&
    playerRect.top < obstacleRect.bottom &&
    playerRect.bottom > obstacleRect.top;

  if (isColliding) {
    gameOver = true;
    obstacle.style.animationPlayState = "paused";
    message.textContent = "패배! 장애물에 부딪혔습니다.";
  }

  if (obstacleRect.right < playerRect.left && !passedObstacle) {
    score++;
    scoreText.textContent = score;
    passedObstacle = true;

    if (score >= 10) {
      gameOver = true;
      obstacle.style.animationPlayState = "paused";
      message.textContent = "승리! 목표 점수 10점을 달성했습니다!";
    }
  }

  if (obstacleRect.left > playerRect.right) {
    passedObstacle = false;
  }
}

function restartGame() {
  score = 0;
  gameOver = false;
  passedObstacle = false;

  scoreText.textContent = score;
  message.textContent = "스페이스바 또는 화면 클릭으로 점프하세요!";

  obstacle.style.animation = "none";

  setTimeout(() => {
    obstacle.style.animation = "moveObstacle 1.8s linear infinite";
    obstacle.style.animationPlayState = "running";
  }, 10);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    jump();
  }
});

document.addEventListener("click", () => {
  jump();
});

restartBtn.addEventListener("click", restartGame);

setInterval(checkCollision, 10);
