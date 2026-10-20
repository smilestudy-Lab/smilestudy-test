import { test } from "node:test";
import assert from "node:assert/strict";
import { levelOf, analyzeByArea, strongestAndWeakest } from "../js/core/analysis.js";

const AREAS = [
  { id: "x", label: "X", categories: ["a", "b"] },
  { id: "y", label: "Y", categories: ["c"] },
  { id: "z", label: "Z", categories: ["d"] },
];

test("levelOf は正答率を 1〜5 にする", () => {
  assert.equal(levelOf(1), 5);
  assert.equal(levelOf(0.99), 4);
  assert.equal(levelOf(0.8), 4);
  assert.equal(levelOf(0.6), 3);
  assert.equal(levelOf(0.4), 2);
  assert.equal(levelOf(0.39), 1);
  assert.equal(levelOf(0), 1);
});

test("analyzeByArea は分野ごとに集計し、問題のない分野は評価なし", () => {
  const results = [
    { category: "a", correct: true },
    { category: "b", correct: false },
    { category: "c", correct: true },
  ];
  const [x, y, z] = analyzeByArea(results, AREAS);
  assert.deepEqual([x.correct, x.total, x.level], [1, 2, 2]);
  assert.deepEqual([y.correct, y.total, y.level], [1, 1, 5]);
  assert.deepEqual([z.total, z.level], [0, null]);
});

test("strongestAndWeakest は評価のある分野から選ぶ", () => {
  const areas = analyzeByArea(
    [
      { category: "a", correct: false },
      { category: "c", correct: true },
    ],
    AREAS,
  );
  const { strongest, weakest } = strongestAndWeakest(areas);
  assert.equal(strongest.id, "y");
  assert.equal(weakest.id, "x");
  assert.deepEqual(strongestAndWeakest([]), { strongest: null, weakest: null });
});
