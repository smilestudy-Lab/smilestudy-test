// 入口：設定・問題データ・テストの中身・各画面をつなぐだけの場所
import { CONFIG } from "./config.js";
import { QUESTIONS } from "./data/questions.js";
import { createAttempt, selectAnswer, countAnswered, grade } from "./core/quiz.js";
import { createCountdown } from "./core/timer.js";
import { applyImages } from "./ui/dom.js";
import { createStartScreen } from "./ui/startScreen.js";
import { createQuizScreen } from "./ui/quizScreen.js";
import { createResultScreen } from "./ui/resultScreen.js";

const questionCount = Math.min(CONFIG.questionCount, QUESTIONS.length);
let attempt = null;

applyImages(CONFIG.images);

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
  },
  onSubmit() {
    const rest = attempt.items.length - countAnswered(attempt);
    if (rest > 0 && !window.confirm(`未回答が ${rest} 問あります。採点しますか？`)) return;
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

function startAttempt() {
  attempt = createAttempt(QUESTIONS, {
    count: questionCount,
    shuffleQuestions: CONFIG.shuffleQuestions,
    shuffleChoices: CONFIG.shuffleChoices,
  });
  quizScreen.show(attempt);
  countdown.start();
}

function finishAttempt({ timedOut }) {
  countdown.stop();
  resultScreen.show(grade(attempt), { timedOut });
}

document.title = CONFIG.appTitle;
quizScreen.updateTimer(CONFIG.timeLimitSec);
startScreen.show();
