// 配列をシャッフルした新しい配列を返す（元の配列は変更しない）。
// random を差し替えられるようにして、テストで結果を固定できるようにしている。
export function shuffle(items, random = Math.random) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
