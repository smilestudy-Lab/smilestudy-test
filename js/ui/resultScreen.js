// 結果画面：点数と各問の ○ × だけを出す（正解は表示しない）
import { el, role, action, showScreen } from "./dom.js";

export function createResultScreen(root, { onRetry }) {
  const headlineEl = role(root, "headline");
  const scoreEl = role(root, "score");
  const totalEl = role(root, "total");
  const messageEl = role(root, "message");
  const listEl = role(root, "results");
  const retryButton = action(root, "retry");

  retryButton.addEventListener("click", onRetry);

  function renderRow(result) {
    const mark = result.correct ? "○" : "×";
    return el("li", { class: `result-row ${result.correct ? "is-correct" : "is-wrong"}` }, [
      el("span", { class: "result-row__mark", text: mark, "aria-label": result.correct ? "正解" : "不正解" }),
      el("span", { class: "result-row__number", text: `第${result.number}問` }),
      el("span", { class: "result-row__question", text: result.question }),
    ]);
  }

  return {
    show({ results, score, total, isPerfect }, { timedOut }) {
      headlineEl.textContent = timedOut ? "時間切れ！ 結果" : "結果";
      scoreEl.textContent = String(score);
      totalEl.textContent = String(total);
      messageEl.textContent = isPerfect
        ? "満点おめでとうございます！ これで研修テストは完了です。"
        : "満点で合格です。× の問題を研修資料・動画で見直して、もう一度挑戦しよう。";
      root.classList.toggle("is-perfect", isPerfect);
      // 満点が出るまで終わらない：満点のときだけ「もう一度」を隠す
      retryButton.hidden = isPerfect;
      listEl.replaceChildren(...results.map(renderRow));
      showScreen(root);
    },
  };
}
