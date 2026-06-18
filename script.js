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

let itemSpeed = 2.2;
let gameOver = false;

const keys = {
  left: false,
  right: false
};

// 낙하물을 받았을 때 효과음
function playCatchSound() {
  const audioContext = new AudioContext();

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    1200,
    audioContext.currentTime + 0.1
  );

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.15
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
}

// 승리했을 때 효과음
function playWinSound() {
  const audioContext = new AudioContext();

  const notes = [523, 659, 784, 1046];

  notes.forEach((note, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      note,
      audioContext.currentTime + index * 0.18
    );

    gainNode.gain.setValueAtTime(
      0.25,
      audioContext.currentTime + index * 0.18
    );

    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + index * 0.18 + 0.15
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime + index * 0.18);
    oscillator.stop(audioContext.currentTime + index * 0.18 + 0.15);
  });
}

// 패배했을 때 효과음
function playLoseSound() {
  const audioContext = new AudioContext();

  const notes = [300, 220, 150];

  notes.forEach((note, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(
      note,
      audioContext.currentTime + index * 0.2
    );

    gainNode.gain.setValueAtTime(
      0.2,
      audioContext.currentTime + index * 0.2
    );

    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + index * 0.2 + 0.18
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime + index * 0.2);
    oscillator.stop(audioContext.currentTime + index * 0.2 + 0.18);
  });
}

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

function showCatchEffect() {
  item.classList.add("catch-effect");

  setTimeout(() => {
    item.classList.remove("catch-effect");
  }, 150);
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

    playCatchSound();
    showCatchEffect();

    if (score % 5 === 0) {
      itemSpeed += 0.4;
    }

    if (score >= 20) {
      gameOver = true;
      message.textContent =
        "🎉 승리! 낙하물 20개를 받았습니다!";

      playWinSound();
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

      playLoseSound();
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

  itemSpeed = 2.2;
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

restartBtn.addEventListener("click", restartGame);

resetItem();
gameLoop();