// ヘッダー：ロゴを押したらスタート画面に戻る
import { action } from "./dom.js";

export function createHeader(root, { onHome }) {
  action(root, "home").addEventListener("click", (event) => {
    event.preventDefault();
    onHome();
  });
}
