const basket = document.getElementById("basket");
const item = document.getElementById("item");

const scoreText = document.getElementById("score");
const missText = document.getElementById("miss");
const levelText = document.getElementById("level");

const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");

const nameBox = document.getElementById("nameBox");
const nicknameInput = document.getElementById("nicknameInput");
const saveRankBtn = document.getElementById("saveRankBtn");
const rankingList = document.getElementById("rankingList");

const gameWidth = 600;
const gameHeight = 400;

const basketWidth = 80;
const itemSize = 35;

let basketX = 260;

let itemX = 0;
let itemY = 0;

let score = 0;
let miss = 0;
let level = 1;

let itemSpeed = 2.0;
let gameOver = false;
let gameStarted = false;
let gameResult = "";
let alreadySaved = false;

const keys = {
  left: false,
  right: false
};

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

function updateDifficulty() {
  if (score < 7) {
    level = 1;
    itemSpeed = 2.0;
  } else if (score < 14) {
    level = 2;
    itemSpeed = 3.0;
  } else {
    level = 3;
    itemSpeed = 4.2;
  }

  levelText.textContent = level;
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
    updateDifficulty();

    if (score === 7) {
      message.textContent = "2단계 시작! 낙하물이 더 빨라집니다.";
    }

    if (score === 14) {
      message.textContent = "3단계 시작! 최고 난이도입니다!";
    }

    if (score >= 20) {
      endGame("승리");
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
      endGame("패배");
      return;
    }

    resetItem();
  }
}

function endGame(result) {
  gameOver = true;
  gameResult = result;
  nameBox.classList.remove("hidden");

  if (result === "승리") {
    message.textContent =
      "🎉 승리! 닉네임을 입력하고 기록을 저장하세요.";
    playWinSound();
  } else {
    message.textContent =
      "💀 패배! 닉네임을 입력하고 기록을 저장하세요.";
    playLoseSound();
  }
}

function saveRanking() {
  if (alreadySaved) {
    alert("이미 기록을 저장했습니다.");
    return;
  }

  const nickname = nicknameInput.value.trim();

  if (nickname === "") {
    alert("닉네임을 입력하세요!");
    return;
  }

  const now = new Date();

  const newRecord = {
    nickname: nickname,
    score: score,
    miss: miss,
    level: level,
    result: gameResult,
    date: now.toLocaleString()
  };

  const records =
    JSON.parse(localStorage.getItem("catchGameRanking")) || [];

  records.push(newRecord);

  if (records.length > 10) {
    records.shift();
  }

  localStorage.setItem(
    "catchGameRanking",
    JSON.stringify(records)
  );

  alreadySaved = true;
  nicknameInput.value = "";
  nameBox.classList.add("hidden");

  showRanking();
}

function showRanking() {
  const records =
    JSON.parse(localStorage.getItem("catchGameRanking")) || [];

  rankingList.innerHTML = "";

  const recentRecords = records.slice().reverse();

  recentRecords.forEach((record, index) => {
    const li = document.createElement("li");

    li.textContent =
      `${index + 1}. ${record.nickname} / ${record.result} / ${record.level || 1}단계 / 점수 ${record.score}점 / 놓침 ${record.miss}개 / ${record.date}`;

    rankingList.appendChild(li);
  });
}

function gameLoop() {
  if (gameOver || !gameStarted) {
    return;
  }

  moveBasket();

  itemY += itemSpeed;
  item.style.top = itemY + "px";

  checkCatch();
  checkMiss();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  gameStarted = true;
  gameOver = false;

  startScreen.classList.add("hidden");

  message.textContent =
    "← → 방향키로 바구니를 움직여 낙하물을 받으세요!";

  resetItem();
  gameLoop();
}

function restartGame() {
  score = 0;
  miss = 0;
  level = 1;

  itemSpeed = 2.0;
  gameOver = false;
  gameStarted = false;
  gameResult = "";
  alreadySaved = false;

  basketX = 260;

  scoreText.textContent = 0;
  missText.textContent = 0;
  levelText.textContent = 1;

  message.textContent =
    "게임 시작 버튼을 눌러주세요!";

  nameBox.classList.add("hidden");
  nicknameInput.value = "";

  startScreen.classList.remove("hidden");

  basket.style.left = basketX + "px";

  resetItem();
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

startBtn.addEventListener("click", startGame);
saveRankBtn.addEventListener("click", saveRanking);
restartBtn.addEventListener("click", restartGame);

resetItem();
showRanking();