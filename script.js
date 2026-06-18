const basket = document.getElementById("basket");
const item = document.getElementById("item");

const scoreText = document.getElementById("score");
const missText = document.getElementById("miss");

const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

const gameWidth = 600;
const gameHeight = 400;

const basketWidth = 80;
const itemSize = 35;

let basketX = 260;

let itemX = 0;
let itemY = 0;

let score = 0;
let miss = 0;

let itemSpeed = 4;
let gameOver = false;

const keys = {
  left: false,
  right: false
};

function moveBasket() {
  if (keys.left) {
    basketX -= 7;
  }

  if (keys.right) {
    basketX += 7;
  }

  if (basketX < 0) {
    basketX = 0;
  }

  if (basketX > gameWidth - basketWidth) {
    basketX = gameWidth - basketWidth;
  }

  basket.style.left = basketX + "px";
}

function resetItem() {
  itemY = -itemSize;

  itemX = Math.floor(
    Math.random() * (gameWidth - itemSize)
  );

  item.style.left = itemX + "px";
  item.style.top = itemY + "px";
}

function checkCatch() {

  const basketTop = gameHeight - 55;

  const itemBottom = itemY + itemSize;

  const hitHeight = itemBottom >= basketTop;

  const hitWidth =
    itemX + itemSize > basketX &&
    itemX < basketX + basketWidth;

  if (hitHeight && hitWidth) {

    score++;

    scoreText.textContent = score;

    if (score % 5 === 0) {
      itemSpeed += 1;
    }

    if (score >= 20) {
      gameOver = true;
      message.textContent =
        "🎉 승리! 낙하물 20개를 받았습니다!";
      return;
    }

    resetItem();
  }
}

function checkMiss() {

  if (itemY > gameHeight) {

    miss++;

    missText.textContent = miss;

    if (miss >= 3) {

      gameOver = true;

      message.textContent =
        "💀 패배! 낙하물을 3개 놓쳤습니다.";

      return;
    }

    resetItem();
  }
}

function gameLoop() {

  if (gameOver) {
    return;
  }

  moveBasket();

  itemY += itemSpeed;

  item.style.top = itemY + "px";

  checkCatch();
  checkMiss();

  requestAnimationFrame(gameLoop);
}

function restartGame() {

  score = 0;
  miss = 0;

  itemSpeed = 4;

  gameOver = false;

  basketX = 260;

  scoreText.textContent = 0;
  missText.textContent = 0;

  message.textContent =
    "← → 방향키로 바구니를 움직여 낙하물을 받으세요!";

  basket.style.left = basketX + "px";

  resetItem();

  gameLoop();
}

document.addEventListener("keydown", (event) => {

  if (event.key === "ArrowLeft") {
    keys.left = true;
  }

  if (event.key === "ArrowRight") {
    keys.right = true;
  }

});

document.addEventListener("keyup", (event) => {

  if (event.key === "ArrowLeft") {
    keys.left = false;
  }

  if (event.key === "ArrowRight") {
    keys.right = false;
  }

});

restartBtn.addEventListener(
  "click",
  restartGame
);

resetItem();
gameLoop();