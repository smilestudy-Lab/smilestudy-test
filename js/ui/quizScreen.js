// 出題画面：全問を1ページに並べ、選んだ答えを onSelect で知らせる
import { el, role, action, showScreen } from "./dom.js";
import { formatTime } from "../core/timer.js";

export function createQuizScreen(root, { warnAtSec, onSelect, onSubmit }) {
  const listEl = role(root, "questions");
  const answeredEl = role(root, "answered");
  const totalEl = role(root, "total");
  const timerEl = role(root, "timer");
  const noteEl = role(root, "unanswered-note");

  action(root, "submit").addEventListener("click", onSubmit);

  function renderQuestion(item, itemIndex) {
    const name = `q-${itemIndex}`;
    const choices = item.choices.map((text, choiceIndex) => {
      const input = el("input", { type: "radio", name, value: String(choiceIndex) });
      input.addEventListener("change", () => onSelect(itemIndex, choiceIndex));
      return el("li", {}, [el("label", { class: "choice" }, [input, el("span", { text })])]);
    });

    return el("li", { class: "question card" }, [
      el("p", { class: "question__number", text: `第${itemIndex + 1}問` }),
      el("p", { class: "question__text", text: item.question }),
      el("ul", { class: "choice-list" }, choices),
    ]);
  }

  return {
    show(attempt) {
      listEl.replaceChildren(...attempt.items.map(renderQuestion));
      totalEl.textContent = String(attempt.items.length);
      this.updateProgress(0, attempt.items.length);
      showScreen(root);
    },

    updateProgress(answered, total) {
      answeredEl.textContent = String(answered);
      const rest = total - answered;
      noteEl.textContent = rest > 0 ? `未回答が ${rest} 問あります（未回答は × になります）` : "すべて回答しました";
    },

    updateTimer(remainingSec) {
      timerEl.textContent = formatTime(remainingSec);
      timerEl.classList.toggle("is-warning", remainingSec <= warnAtSec);
    },
  };
}
