// テストの中身（出題・解答・採点）だけを扱う。画面（DOM）には一切触れない。
import { shuffle } from "./shuffle.js";

/**
 * 1回分の受験（アテンプト）を作る。
 * @param {Array<{id:string, question:string, choices:string[], answer:number}>} questions
 * @param {{count?:number, shuffleQuestions?:boolean, shuffleChoices?:boolean, random?:() => number}} options
 */
export function createAttempt(questions, options = {}) {
  const {
    count = questions.length,
    shuffleQuestions = true,
    shuffleChoices = true,
    random = Math.random,
  } = options;

  const ordered = shuffleQuestions ? shuffle(questions, random) : questions.slice();
  const picked = ordered.slice(0, Math.min(count, ordered.length));

  const items = picked.map((q) => {
    // 選択肢を並べ替えても正解がわかるよう、元の番号を持たせておく
    const indexed = q.choices.map((text, originalIndex) => ({ text, originalIndex }));
    const choices = shuffleChoices ? shuffle(indexed, random) : indexed;
    return {
      id: q.id,
      category: q.category,
      question: q.question,
      choices: choices.map((c) => c.text),
      correctIndex: choices.findIndex((c) => c.originalIndex === q.answer),
    };
  });

  return {
    items,
    // 各問題で選んだ選択肢の番号。未回答は null
    selections: items.map(() => null),
  };
}

/** 選択肢を選ぶ（同じ問題で選び直すと上書き）。新しいアテンプトを返す。 */
export function selectAnswer(attempt, itemIndex, choiceIndex) {
  if (itemIndex < 0 || itemIndex >= attempt.items.length) {
    throw new RangeError(`itemIndex ${itemIndex} is out of range`);
  }
  const choiceCount = attempt.items[itemIndex].choices.length;
  if (choiceIndex < 0 || choiceIndex >= choiceCount) {
    throw new RangeError(`choiceIndex ${choiceIndex} is out of range`);
  }
  const selections = attempt.selections.slice();
  selections[itemIndex] = choiceIndex;
  return { ...attempt, selections };
}

export function countAnswered(attempt) {
  return attempt.selections.filter((s) => s !== null).length;
}

/** 採点する。未回答は不正解として数える。 */
export function grade(attempt) {
  const results = attempt.items.map((item, i) => ({
    id: item.id,
    number: i + 1,
    question: item.question,
    answered: attempt.selections[i] !== null,
    correct: attempt.selections[i] === item.correctIndex,
  }));
  const score = results.filter((r) => r.correct).length;
  const total = results.length;
  return { results, score, total, isPerfect: total > 0 && score === total };
}
