// 出題画面：1問ずつ表示する。選んだ答えは onSelect で、前の問題へは onPrev で知らせる
import { el, role, action, showScreen } from "./dom.js";
import { formatTime } from "../core/timer.js";

const CHOICE_LABELS = ["A", "B", "C", "D"];

export function createQuizScreen(root, { warnAtSec, onSelect, onPrev, onSubmit }) {
  const currentEl = role(root, "current");
  const totalEl = role(root, "total");
  const answeredEl = role(root, "answered");
  const timerEl = role(root, "timer");
  const progressEl = role(root, "progress");
  const questionEl = role(root, "question");
  const numberEl = role(root, "number");
  const categoryEl = role(root, "category");
  const textEl = role(root, "text");
  const choicesEl = role(root, "choices");
  const prevButton = action(root, "prev");

  prevButton.addEventListener("click", onPrev);
  action(root, "submit").addEventListener("click", onSubmit);

  // 自動で次へ進むまでのあいだ、二重に押されないようにする
  let locked = false;

  function renderChoices(item, itemIndex, selected) {
    return item.choices.map((text, choiceIndex) => {
      const button = el("button", {
        type: "button",
        class: `choice${choiceIndex === selected ? " is-selected" : ""}`,
        "aria-pressed": String(choiceIndex === selected),
      }, [
        el("span", { class: "choice__label", text: CHOICE_LABELS[choiceIndex] }),
        el("span", { class: "choice__text", text }),
      ]);
      button.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        for (const b of choicesEl.querySelectorAll(".choice")) {
          b.classList.toggle("is-selected", b === button);
          b.setAttribute("aria-pressed", String(b === button));
        }
        onSelect(itemIndex, choiceIndex);
      });
      return el("li", {}, [button]);
    });
  }

  return {
    show() {
      showScreen(root);
    },

    /** itemIndex 番目の問題を表示する */
    render(attempt, itemIndex) {
      locked = false;
      const item = attempt.items[itemIndex];
      const total = attempt.items.length;
      currentEl.textContent = String(itemIndex + 1);
      totalEl.textContent = String(total);
      numberEl.textContent = `Q${itemIndex + 1}`;
      categoryEl.textContent = item.category;
      textEl.textContent = item.question;
      choicesEl.replaceChildren(...renderChoices(item, itemIndex, attempt.selections[itemIndex]));
      prevButton.disabled = itemIndex === 0;
      // 切り替わったことがわかるよう、カードを小さく動かす
      questionEl.classList.remove("is-entering");
      void questionEl.offsetWidth;
      questionEl.classList.add("is-entering");
    },

    updateProgress(answered, total) {
      answeredEl.textContent = String(answered);
      progressEl.style.width = `${total === 0 ? 0 : (answered / total) * 100}%`;
    },

    updateTimer(remainingSec) {
      timerEl.textContent = formatTime(remainingSec);
      timerEl.classList.toggle("is-warning", remainingSec <= warnAtSec);
    },
  };
}
