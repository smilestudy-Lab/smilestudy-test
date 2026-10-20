// 入口：設定・問題データ・テストの中身・各画面をつなぐだけの場所
import { CONFIG } from "./config.js";
import { QUESTIONS } from "./data/questions.js";
import { AREAS } from "./data/areas.js";
import { createAttempt, selectAnswer, countAnswered, nextUnanswered, grade } from "./core/quiz.js";
import { analyzeByArea, strongestAndWeakest } from "./core/analysis.js";
import { createCountdown } from "./core/timer.js";
import { applyImages } from "./ui/dom.js";
import { createHeader } from "./ui/header.js";
import { createStartScreen } from "./ui/startScreen.js";
import { createQuizScreen } from "./ui/quizScreen.js";
import { createResultScreen } from "./ui/resultScreen.js";

const questionCount = Math.min(CONFIG.questionCount, QUESTIONS.length);
// 今の状態はここだけで持つ（受験中でなければ attempt は null）
let attempt = null;
let currentIndex = 0;
let advanceTimer = null;

applyImages(CONFIG.images);

createHeader(document.querySelector(".site-header"), { onHome: goHome });

const startScreen = createStartScreen(document.getElementById("screen-start"), {
  questionCount,
  timeLimitLabel: `${Math.round(CONFIG.timeLimitSec / 60)}分`,
  onStart: startAttempt,
});

const quizScreen = createQuizScreen(document.getElementById("screen-quiz"), {
  warnAtSec: CONFIG.warnAtSec,
  onSelect(itemIndex, choiceIndex) {
    attempt = selectAnswer(attempt, itemIndex, choiceIndex);
    quizScreen.updateProgress(countAnswered(attempt), attempt.items.length);
    // 選んだ答えが一瞬見えてから、次の未回答の問題へ。全部答えたら採点
    advanceTimer = setTimeout(() => {
      advanceTimer = null;
      const next = nextUnanswered(attempt, itemIndex);
      if (next === -1) finishAttempt({ timedOut: false });
      else goTo(next);
    }, CONFIG.autoAdvanceMs);
  },
  onPrev() {
    cancelAdvance();
    if (currentIndex > 0) goTo(currentIndex - 1);
  },
  onSubmit() {
    const rest = attempt.items.length - countAnswered(attempt);
    const text = rest > 0 ? `未回答が ${rest} 問あります（未回答は × になります）。採点しますか？` : "採点しますか？";
    if (!window.confirm(text)) return;
    finishAttempt({ timedOut: false });
  },
});

const resultScreen = createResultScreen(document.getElementById("screen-result"), {
  onRetry: startAttempt,
});

const countdown = createCountdown({
  durationSec: CONFIG.timeLimitSec,
  onTick: (remaining) => quizScreen.updateTimer(remaining),
  onExpire: () => finishAttempt({ timedOut: true }),
});

function goTo(itemIndex) {
  currentIndex = itemIndex;
  quizScreen.render(attempt, itemIndex);
}

function cancelAdvance() {
  if (advanceTimer !== null) clearTimeout(advanceTimer);
  advanceTimer = null;
}

function startAttempt() {
  cancelAdvance();
  attempt = createAttempt(QUESTIONS, {
    count: questionCount,
    shuffleQuestions: CONFIG.shuffleQuestions,
    shuffleChoices: CONFIG.shuffleChoices,
  });
  quizScreen.updateProgress(0, attempt.items.length);
  goTo(0);
  quizScreen.show();
  countdown.start();
}

function finishAttempt({ timedOut }) {
  cancelAdvance();
  countdown.stop();
  const graded = grade(attempt);
  const areas = analyzeByArea(graded.results, AREAS);
  attempt = null;
  resultScreen.show(graded, { timedOut, areas, ...strongestAndWeakest(areas) });
}

function goHome() {
  if (attempt !== null && !window.confirm("テストを中断して、スタート画面に戻りますか？")) return;
  cancelAdvance();
  countdown.stop();
  attempt = null;
  quizScreen.updateTimer(CONFIG.timeLimitSec);
  startScreen.show();
}

document.title = CONFIG.appTitle;
quizScreen.updateTimer(CONFIG.timeLimitSec);
startScreen.show();
