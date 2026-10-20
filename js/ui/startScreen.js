// スタート画面
import { action, showScreen } from "./dom.js";

export function createStartScreen(root, { questionCount, timeLimitLabel, onStart }) {
  root.querySelector('[data-text="questionCount"]').textContent = String(questionCount);
  root.querySelector('[data-text="timeLimit"]').textContent = timeLimitLabel;
  action(root, "start").addEventListener("click", onStart);

  return {
    show() {
      showScreen(root);
    },
  };
}
