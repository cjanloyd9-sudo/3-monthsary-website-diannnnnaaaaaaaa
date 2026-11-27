// Change the secret passcode here.
const SECRET_PASSCODE = "2911";

const story = document.getElementById("story");
const lockForm = document.getElementById("lockForm");
const passcode = document.getElementById("passcode");
const lockMessage = document.getElementById("lockMessage");
const successOverlay = document.getElementById("successOverlay");
const indicatorDots = [...document.querySelectorAll(".indicator-dot")];

function setPage(pageNumber) {
  story.dataset.page = String(pageNumber);
  indicatorDots.forEach((dot, index) => dot.classList.toggle("active", index === pageNumber));
  document.querySelectorAll(".story-page").forEach((page, index) => {
    page.classList.toggle("active", index === pageNumber);
  });
}

lockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passcode.value === SECRET_PASSCODE) {
    lockMessage.textContent = "";
    successOverlay.classList.add("show");
    successOverlay.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      successOverlay.classList.remove("show");
      successOverlay.setAttribute("aria-hidden", "true");
      setPage(1);
    }, 2000);
  } else {
    lockMessage.textContent = "Oopsie! Wrong passcode, try again baby ♡";
    passcode.value = "";
    passcode.focus();
  }
});

passcode.addEventListener("input", () => {
  passcode.value = passcode.value.replace(/[^0-9]/g, "");
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => setPage(Number(button.dataset.go)));
});

indicatorDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const requestedPage = Number(dot.dataset.page);
    if (requestedPage === 0) {
      setPage(0);
    } else if (story.dataset.page !== "0") {
      setPage(requestedPage);
    }
  });
});

const envelope = document.getElementById("envelope");
function toggleEnvelope() { envelope.classList.toggle("open"); }
envelope.addEventListener("click", toggleEnvelope);
envelope.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleEnvelope();
  }
});

// Floating hearts throughout the scrapbook.
function createFloatingHeart() {
  const heartsLayer = document.getElementById("heartsLayer");
  const heart = document.createElement("span");
  heart.className = "heart-float";
  heart.textContent = Math.random() > .45 ? "♥" : "♡";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${12 + Math.random() * 18}px`;
  heart.style.setProperty("--duration", `${5 + Math.random() * 5}s`);
  heart.style.opacity = String(.35 + Math.random() * .55);
  heartsLayer.appendChild(heart);
  window.setTimeout(() => heart.remove(), 10000);
}
setInterval(createFloatingHeart, 700);

// Add a tiny heart cursor effect on non-touch screens.
if (window.matchMedia("(pointer:fine)").matches) {
  let cursorTick = 0;
  document.addEventListener("mousemove", (event) => {
    cursorTick++;
    if (cursorTick % 7 !== 0) return;
    const spark = document.createElement("span");
    spark.textContent = "♡";
    spark.style.cssText = `position:fixed;z-index:110;left:${event.clientX}px;top:${event.clientY}px;color:#d66a91;font-size:12px;pointer-events:none;transition:.7s ease;`;
    document.body.appendChild(spark);
    requestAnimationFrame(() => {
      spark.style.transform = "translateY(-22px) scale(.3)";
      spark.style.opacity = "0";
    });
    window.setTimeout(() => spark.remove(), 700);
  });
}

// Music player. Add music/our-song.mp3 to enable playback.
const audio = document.getElementById("audio");
const playButton = document.getElementById("playButton");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

playButton.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
      playButton.textContent = "Ⅱ";
      playButton.setAttribute("aria-label", "Pause music");
    } catch (error) {
      playButton.textContent = "▶";
    }
  } else {
    audio.pause();
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play music");
  }
});

audio.addEventListener("loadedmetadata", () => {
  progress.value = "0";
});

audio.addEventListener("timeupdate", () => {
  if (audio.duration) progress.value = String((audio.currentTime / audio.duration) * 100);
});

progress.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
});

volume.addEventListener("input", () => { audio.volume = Number(volume.value); });
audio.volume = .7;

audio.addEventListener("ended", () => {
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Play music");
});

// Final surprise.
const loveButton = document.getElementById("loveButton");
const lovePopup = document.getElementById("lovePopup");
const popupClose = document.getElementById("popupClose");

loveButton.addEventListener("click", () => {
  lovePopup.classList.add("show");
  lovePopup.setAttribute("aria-hidden", "false");
  for (let i = 0; i < 28; i++) {
    window.setTimeout(createFloatingHeart, i * 35);
  }
});

function closePopup() {
  lovePopup.classList.remove("show");
  lovePopup.setAttribute("aria-hidden", "true");
}
popupClose.addEventListener("click", closePopup);
lovePopup.addEventListener("click", (event) => {
  if (event.target === lovePopup) closePopup();
});

// Restart the entire story.
document.getElementById("restartButton").addEventListener("click", () => {
  passcode.value = "";
  lockMessage.textContent = "";
  closePopup();
  resetQuiz();
  setPage(0);
});

// Five-question anniversary quiz.
const quizQuestions = [
  {
    question: "What was our first hangout just us togethier?",
    answers: ["Going shopping", "Watching the Spider-Man movie", "Going to the beach", "Eating together"],
    correct: 1
  },
  {
    question: "What special plushie did I get you?",
    answers: ["Teddy bear", "Bunny", "Jellycat", "Panda"],
    correct: 2
  },
  {
    question: "When is my birthday?",
    answers: ["Dec 5", "Dec 15", "Dec 6", "Dec 25"],
    correct: 0
  },
  {
    question: "What is my favourite thing about giving you gifts?",
    answers: ["Seeing you smile", "Spending money", "Taking pictures", "Getting gifts back"],
    correct: 0
  },
  {
    question: "How many months are we celebrating?",
    answers: ["One", "Two", "Three", "Four"],
    correct: 2
  }
];

let quizIndex = 0;
let quizScore = 0;
let questionAnswered = false;

const quizCard = document.getElementById("quizCard");
const quizResult = document.getElementById("quizResult");
const quizCount = document.getElementById("quizCount");
const quizQuestion = document.getElementById("quizQuestion");
const quizAnswers = document.getElementById("quizAnswers");
const quizFeedback = document.getElementById("quizFeedback");
const quizNext = document.getElementById("quizNext");
const quizProgress = document.getElementById("quizProgress");
const quizScoreText = document.getElementById("quizScore");

function renderQuizQuestion() {
  questionAnswered = false;
  quizFeedback.textContent = "";
  quizNext.hidden = true;

  const current = quizQuestions[quizIndex];
  quizCount.textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  quizQuestion.textContent = current.question;
  quizProgress.style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
  quizAnswers.innerHTML = "";

  current.answers.forEach((answer, answerIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-answer";
    button.textContent = String.fromCharCode(65 + answerIndex) + ". " + answer;
    button.addEventListener("click", () => answerQuiz(answerIndex, button));
    quizAnswers.appendChild(button);
  });
}

function answerQuiz(answerIndex, selectedButton) {
  if (questionAnswered) return;
  questionAnswered = true;

  const buttons = [...quizAnswers.querySelectorAll(".quiz-answer")];
  const current = quizQuestions[quizIndex];
  buttons.forEach((button) => button.disabled = true);

  selectedButton.classList.add("selected");

  if (answerIndex === current.correct) {
    selectedButton.classList.remove("selected");
    selectedButton.classList.add("correct");
    quizFeedback.textContent = "YAYYY! YOU GOT IT BABY! 💗";
    quizScore++;

    for (let i = 0; i < 10; i++) {
      window.setTimeout(createFloatingHeart, i * 45);
    }
  } else {
    selectedButton.classList.remove("selected");
    selectedButton.classList.add("wrong");
    buttons[current.correct].classList.add("correct");
    quizFeedback.textContent = "OOPSIE! TRY AGAIN LOVE ♡";
  }

  quizProgress.style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;
  quizNext.hidden = false;
  quizNext.textContent = quizIndex === quizQuestions.length - 1 ? "See My Score ♡" : "Next Question ♡";
}

quizNext.addEventListener("click", () => {
  if (quizIndex < quizQuestions.length - 1) {
    quizIndex++;
    renderQuizQuestion();
  } else {
    showQuizResult();
  }
});

function showQuizResult() {
  quizCard.hidden = true;
  quizResult.hidden = false;

  let resultText = `${quizScore}/5`;
  if (quizScore === 5) {
    resultText += " — YOU KNOW US SO WELL!";
  } else if (quizScore >= 3) {
    resultText += " — YOU KNOW OUR LOVE STORY BEAUTIFULLY!";
  } else {
    resultText += " — EVERY ANSWER IS ANOTHER MEMORY TO LOVE!";
  }
  quizScoreText.textContent = resultText;

  for (let i = 0; i < 22; i++) {
    window.setTimeout(createFloatingHeart, i * 40);
  }
}

function resetQuiz() {
  quizIndex = 0;
  quizScore = 0;
  questionAnswered = false;
  quizResult.hidden = true;
  quizCard.hidden = false;
  quizProgress.style.width = "0";
  renderQuizQuestion();
}

document.getElementById("playAgain").addEventListener("click", resetQuiz);
document.getElementById("continueStory").addEventListener("click", () => setPage(5));

setPage(0);
renderQuizQuestion();
