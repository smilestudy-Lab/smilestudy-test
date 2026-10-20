// 採点結果を分野ごとに集計し、5段階の評価をつける。画面（DOM）には触れない。

/** 正答率（0〜1）を 1〜5 の評価にする */
export function levelOf(rate) {
  if (rate >= 1) return 5;
  if (rate >= 0.8) return 4;
  if (rate >= 0.6) return 3;
  if (rate >= 0.4) return 2;
  return 1;
}

/**
 * 分野ごとの正解数・正答率・評価を出す。
 * @param {Array<{category:string, correct:boolean}>} results grade() の results
 * @param {Array<{id:string, label:string, categories:string[]}>} areas
 */
export function analyzeByArea(results, areas) {
  return areas.map((area) => {
    const inArea = results.filter((r) => area.categories.includes(r.category));
    const correct = inArea.filter((r) => r.correct).length;
    const total = inArea.length;
    const rate = total === 0 ? 0 : correct / total;
    return { id: area.id, label: area.label, correct, total, rate, level: total === 0 ? null : levelOf(rate) };
  });
}

/** いちばん強い分野・弱い分野（評価のついた分野だけで比べる） */
export function strongestAndWeakest(areaResults) {
  const rated = areaResults.filter((a) => a.level !== null);
  if (rated.length === 0) return { strongest: null, weakest: null };
  const byRate = rated.slice().sort((a, b) => b.rate - a.rate);
  return { strongest: byRate[0], weakest: byRate[byRate.length - 1] };
}
