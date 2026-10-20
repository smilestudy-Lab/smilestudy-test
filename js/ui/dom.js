// 画面操作の小さな共通部品。

/** 要素を作る。attrs の class は className、text は textContent として扱う */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

/** 画面内の data-role="name" の要素を取り出す */
export function role(root, name) {
  const node = root.querySelector(`[data-role="${name}"]`);
  if (!node) throw new Error(`data-role="${name}" が見つかりません`);
  return node;
}

/** 画面内の data-action="name" のボタンを取り出す */
export function action(root, name) {
  const node = root.querySelector(`[data-action="${name}"]`);
  if (!node) throw new Error(`data-action="${name}" が見つかりません`);
  return node;
}

/** 指定した画面だけを表示する */
export function showScreen(screenEl) {
  for (const screen of document.querySelectorAll(".screen")) {
    screen.hidden = screen !== screenEl;
  }
  window.scrollTo({ top: 0 });
}

/** data-image="key" の img に、設定の画像パスを入れる。読めなければ代わりの画像を使う */
export function applyImages(images) {
  for (const img of document.querySelectorAll("img[data-image]")) {
    const key = img.dataset.image;
    const src = images[key];
    if (!src) continue;
    const fallback = images[`${key}Fallback`];
    if (fallback) {
      img.addEventListener("error", () => { img.src = fallback; }, { once: true });
    }
    img.src = src;
  }
}
