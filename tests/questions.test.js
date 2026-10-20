// 問題データの形をチェックする。問題を追加・修正したら必ず通ること。
import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS } from "../js/data/questions.js";
import { CONFIG } from "../js/config.js";
import { AREAS } from "../js/data/areas.js";
import { existsSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);

test("出題数ぶん以上の問題がある", () => {
  assert.ok(
    QUESTIONS.length >= CONFIG.questionCount,
    `問題が ${QUESTIONS.length} 問しかありません（必要：${CONFIG.questionCount} 問）`,
  );
});

test("id が重複していない", () => {
  const ids = QUESTIONS.map((q) => q.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dupes, [], `重複した id: ${dupes.join(", ")}`);
});

for (const q of QUESTIONS) {
  test(`${q.id} の形が正しい`, () => {
    assert.match(q.id, /^q\d{3}$/, "id は q001 の形にする");
    for (const key of ["category", "source", "question", "explanation"]) {
      assert.equal(typeof q[key], "string", `${key} は文字列`);
      assert.ok(q[key].trim().length > 0, `${key} が空です`);
    }
    assert.ok(Array.isArray(q.choices), "choices は配列");
    assert.ok(q.choices.length >= 2 && q.choices.length <= 4, "選択肢は 2〜4 個");
    assert.ok(q.choices.every((c) => typeof c === "string" && c.trim().length > 0), "空の選択肢があります");
    assert.equal(new Set(q.choices).size, q.choices.length, "同じ選択肢が重複しています");
    assert.ok(Number.isInteger(q.answer), "answer は整数");
    assert.ok(q.answer >= 0 && q.answer < q.choices.length, "answer が選択肢の範囲外です");
    if (q.image !== undefined) {
      assert.ok(existsSync(new URL(q.image, ROOT)), `画像ファイルがありません: ${q.image}`);
    }
    const areas = AREAS.filter((a) => a.categories.includes(q.category));
    assert.equal(areas.length, 1, `category「${q.category}」は js/data/areas.js のどれか1つの分野に入れる`);
  });
}

test("分野は5つで、id が重複していない", () => {
  assert.equal(AREAS.length, 5, "五角形グラフなので分野は5つ");
  assert.equal(new Set(AREAS.map((a) => a.id)).size, AREAS.length);
});

test("どの分野にも問題がある", () => {
  for (const area of AREAS) {
    assert.ok(QUESTIONS.some((q) => area.categories.includes(q.category)), `「${area.label}」の問題がありません`);
  }
});
