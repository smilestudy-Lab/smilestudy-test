// 結果画面：点数・分野ごとの5段階評価（五角形グラフ）・まちがえた問題の解説を出す
import { el, role, action, showScreen } from "./dom.js";
import { createRadarChart } from "./radarChart.js";

export function createResultScreen(root, { onRetry }) {
  const headlineEl = role(root, "headline");
  const scoreEl = role(root, "score");
  const totalEl = role(root, "total");
  const messageEl = role(root, "message");
  const radarEl = role(root, "radar");
  const areasEl = role(root, "areas");
  const commentEl = role(root, "comment");
  const wrongSection = role(root, "review-wrong");
  const wrongCountEl = role(root, "wrong-count");
  const wrongListEl = role(root, "wrong-list");
  const correctCountEl = role(root, "correct-count");
  const correctListEl = role(root, "correct-list");
  const retryButton = action(root, "retry");

  retryButton.addEventListener("click", onRetry);

  function renderArea(area) {
    const stars = area.level === null ? "" : "★".repeat(area.level) + "☆".repeat(5 - area.level);
    return el("li", { class: `area-row level-${area.level ?? 0}` }, [
      el("span", { class: "area-row__label", text: area.label }),
      el("span", { class: "area-row__stars", text: stars, "aria-label": `5段階中 ${area.level}` }),
      el("span", { class: "area-row__count", text: `${area.correct}/${area.total}` }),
    ]);
  }

  function renderComment(strongest, weakest, isPerfect) {
    if (isPerfect) return "すべての分野で満点です。研修の内容がしっかり身についています！";
    if (!strongest || !weakest || strongest.rate === weakest.rate) {
      return "解説を読んで、まちがえた問題を見直してから、もう一度挑戦しよう。";
    }
    return `「${strongest.label}」がいちばん得意です。「${weakest.label}」をもう一度見直すと、満点に近づきます。`;
  }

  function renderWrong(result) {
    const children = [
      el("div", { class: "review-item__head" }, [
        el("span", { class: "badge badge--wrong", text: "×" }),
        el("span", { class: "badge badge--category", text: result.category }),
      ]),
      el("p", { class: "review-item__question", text: result.question }),
      el("dl", { class: "answer-compare" }, [
        el("dt", { text: "あなたの答え" }),
        el("dd", { class: "answer-compare__yours", text: result.selectedText ?? "（未回答）" }),
        el("dt", { text: "正解" }),
        el("dd", { class: "answer-compare__correct", text: result.correctText }),
      ]),
      el("p", { class: "review-item__explanation", text: result.explanation }),
    ];
    if (result.image) {
      children.push(el("figure", { class: "review-item__figure" }, [
        el("img", { src: result.image, alt: `解説スライド：${result.category}`, loading: "lazy" }),
        el("figcaption", { text: "研修資料より" }),
      ]));
    }
    return el("li", { class: "card review-item" }, children);
  }

  function renderCorrect(result) {
    return el("li", { class: "result-row is-correct" }, [
      el("span", { class: "result-row__mark", text: "○", "aria-label": "正解" }),
      el("span", { class: "result-row__question", text: result.question }),
    ]);
  }

  return {
    show({ results, score, total, isPerfect }, { timedOut, areas, strongest, weakest }) {
      headlineEl.textContent = timedOut ? "時間切れ！ 結果" : isPerfect ? "合格！" : "結果";
      scoreEl.textContent = String(score);
      totalEl.textContent = String(total);
      messageEl.textContent = isPerfect
        ? "満点おめでとうございます！ これで研修テストは完了です。"
        : "満点で合格です。下の解説で見直して、もう一度挑戦しよう。";
      root.classList.toggle("is-perfect", isPerfect);
      // 満点が出るまで終わらない：満点のときだけ「もう一度」を隠す
      retryButton.hidden = isPerfect;

      radarEl.replaceChildren(createRadarChart(areas));
      areasEl.replaceChildren(...areas.map(renderArea));
      commentEl.textContent = renderComment(strongest, weakest, isPerfect);

      const wrong = results.filter((r) => !r.correct);
      const correct = results.filter((r) => r.correct);
      wrongSection.hidden = wrong.length === 0;
      wrongCountEl.textContent = `${wrong.length}問`;
      wrongListEl.replaceChildren(...wrong.map(renderWrong));
      correctCountEl.textContent = `（${correct.length}問）`;
      correctListEl.replaceChildren(...correct.map(renderCorrect));
      showScreen(root);
    },
  };
}
