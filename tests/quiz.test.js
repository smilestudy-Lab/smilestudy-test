import { test } from "node:test";
import assert from "node:assert/strict";
import { createAttempt, selectAnswer, countAnswered, nextUnanswered, grade } from "../js/core/quiz.js";
import { shuffle } from "../js/core/shuffle.js";
import { formatTime } from "../js/core/timer.js";

const SAMPLE = [
  { id: "q001", category: "a", question: "1+1は？", choices: ["2", "3", "4"], answer: 0 },
  { id: "q002", category: "a", question: "2+2は？", choices: ["3", "4"], answer: 1 },
  { id: "q003", category: "b", question: "3+3は？", choices: ["5", "7", "6", "8"], answer: 2 },
];

// 決まった順に値を返す乱数（テストで結果を固定するため）
function seeded(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function answerAllCorrectly(attempt) {
  return attempt.items.reduce((acc, item, i) => selectAnswer(acc, i, item.correctIndex), attempt);
}

test("shuffle は元の配列を変えず、同じ要素を返す", () => {
  const original = [1, 2, 3, 4, 5];
  const result = shuffle(original, seeded(7));
  assert.deepEqual(original, [1, 2, 3, 4, 5]);
  assert.deepEqual([...result].sort(), [1, 2, 3, 4, 5]);
});

test("シャッフルしても正解の選択肢を正しく追える", () => {
  for (let seed = 1; seed < 50; seed += 1) {
    const attempt = createAttempt(SAMPLE, { random: seeded(seed) });
    for (const item of attempt.items) {
      const original = SAMPLE.find((q) => q.id === item.id);
      assert.equal(item.choices[item.correctIndex], original.choices[original.answer]);
    }
  }
});

test("count で出題数を絞れる", () => {
  const attempt = createAttempt(SAMPLE, { count: 2, random: seeded(3) });
  assert.equal(attempt.items.length, 2);
  assert.equal(attempt.selections.length, 2);
});

test("全問正解なら満点", () => {
  const attempt = answerAllCorrectly(createAttempt(SAMPLE, { random: seeded(5) }));
  const result = grade(attempt);
  assert.equal(result.score, 3);
  assert.equal(result.total, 3);
  assert.equal(result.isPerfect, true);
  assert.ok(result.results.every((r) => r.correct));
});

test("未回答は × として数える", () => {
  const attempt = createAttempt(SAMPLE, { shuffleQuestions: false, shuffleChoices: false });
  const answered = selectAnswer(attempt, 0, 0);
  assert.equal(countAnswered(answered), 1);
  const result = grade(answered);
  assert.equal(result.score, 1);
  assert.equal(result.isPerfect, false);
  assert.equal(result.results[1].answered, false);
  assert.equal(result.results[1].correct, false);
});

test("選び直すと最後に選んだ答えで採点する", () => {
  let attempt = createAttempt(SAMPLE, { shuffleQuestions: false, shuffleChoices: false });
  attempt = selectAnswer(attempt, 0, 1);
  attempt = selectAnswer(attempt, 0, 0);
  assert.equal(grade(attempt).results[0].correct, true);
});

test("selectAnswer は元のアテンプトを変えない", () => {
  const attempt = createAttempt(SAMPLE, { shuffleQuestions: false, shuffleChoices: false });
  selectAnswer(attempt, 0, 0);
  assert.equal(countAnswered(attempt), 0);
});

test("範囲外の選択はエラーになる", () => {
  const attempt = createAttempt(SAMPLE, { shuffleQuestions: false, shuffleChoices: false });
  assert.throws(() => selectAnswer(attempt, 5, 0), RangeError);
  assert.throws(() => selectAnswer(attempt, 1, 2), RangeError);
});

test("formatTime は m:ss の形にする", () => {
  assert.equal(formatTime(600), "10:00");
  assert.equal(formatTime(65), "1:05");
  assert.equal(formatTime(0), "0:00");
});

test("grade は正解・選んだ答え・解説を返す", () => {
  const questions = SAMPLE.map((q) => ({ ...q, explanation: `${q.id}の解説` }));
  let attempt = createAttempt(questions, { shuffleQuestions: false, shuffleChoices: false });
  attempt = selectAnswer(attempt, 0, 1);
  const [first, second] = grade(attempt).results;
  assert.equal(first.correct, false);
  assert.equal(first.selectedText, "3");
  assert.equal(first.correctText, "2");
  assert.equal(first.explanation, "q001の解説");
  assert.equal(first.category, "a");
  assert.equal(first.image, null);
  assert.equal(second.selectedText, null);
});

test("nextUnanswered は次の未回答を探し、最後まで行くと先頭に戻る", () => {
  let attempt = createAttempt(SAMPLE, { shuffleQuestions: false, shuffleChoices: false });
  assert.equal(nextUnanswered(attempt, 0), 1);
  attempt = selectAnswer(attempt, 1, 0);
  assert.equal(nextUnanswered(attempt, 0), 2);
  attempt = selectAnswer(attempt, 2, 0);
  assert.equal(nextUnanswered(attempt, 2), 0);
  attempt = selectAnswer(attempt, 0, 0);
  assert.equal(nextUnanswered(attempt, 0), -1);
});
