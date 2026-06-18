const basket = document.getElementById("basket");
const item = document.getElementById("item");

const scoreText = document.getElementById("score");
const missText = document.getElementById("miss");

const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

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

let itemSpeed = 2.2;
let gameOver = false;
let gameResult = "";
let alreadySaved = false;

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
    result: gameResult,
    date: now.toLocaleString()
  };

  const records =
    JSON.parse(localStorage.getItem("catchGameRanking")) || [];

  records.push(newRecord);

  // 최근 10개 기록만 저장
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
      `${index + 1}. ${record.nickname} / ${record.result} / 점수 ${record.score}점 / 놓침 ${record.miss}개 / ${record.date}`;

    rankingList.appendChild(li);
  });
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
  gameResult = "";
  alreadySaved = false;

  basketX = 260;

  scoreText.textContent = 0;
  missText.textContent = 0;

  message.textContent =
    "← → 방향키로 바구니를 움직여 낙하물을 받으세요!";

  nameBox.classList.add("hidden");
  nicknameInput.value = "";

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

saveRankBtn.addEventListener("click", saveRanking);
restartBtn.addEventListener("click", restartGame);

resetItem();
showRanking();
gameLoop();