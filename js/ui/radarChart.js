// 五角形（レーダー）グラフを SVG で描く。外部ライブラリは使わない。

const SVG_NS = "http://www.w3.org/2000/svg";

function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * @param {Array<{label:string, level:number|null}>} axes 分野（上から時計回り）
 * @param {{maxLevel?:number}} options
 * @returns {SVGSVGElement}
 */
export function createRadarChart(axes, { maxLevel = 5 } = {}) {
  // 横に分野名を書くので、横長にとる
  const width = 520;
  const height = 330;
  const cx = width / 2;
  const cy = 172;
  const radius = 105;
  const n = axes.length;

  const point = (index, value) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / n;
    const r = (radius * value) / maxLevel;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  const toPoints = (values) => values.map((v, i) => point(i, v).map((c) => c.toFixed(1)).join(",")).join(" ");

  const root = svg("svg", {
    viewBox: `0 0 ${width} ${height}`,
    class: "radar",
    role: "img",
    "aria-label": axes.map((a) => `${a.label} ${a.level ?? "-"}`).join("、"),
  });

  // 目盛り（1〜5の五角形）
  for (let level = 1; level <= maxLevel; level++) {
    root.append(svg("polygon", {
      points: toPoints(axes.map(() => level)),
      class: level === maxLevel ? "radar__ring radar__ring--outer" : "radar__ring",
    }));
  }
  // 中心から各分野への線
  axes.forEach((_, i) => {
    const [x, y] = point(i, maxLevel);
    root.append(svg("line", { x1: cx, y1: cy, x2: x, y2: y, class: "radar__axis" }));
  });

  // 自分の結果
  const values = axes.map((a) => a.level ?? 0);
  root.append(svg("polygon", { points: toPoints(values), class: "radar__area" }));
  values.forEach((v, i) => {
    const [x, y] = point(i, v);
    root.append(svg("circle", { cx: x, cy: y, r: 4.5, class: "radar__dot" }));
  });

  // 分野名と評価
  axes.forEach((axis, i) => {
    const [x, y] = point(i, maxLevel + 1.1);
    const anchor = Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end";
    const label = svg("text", { x, y, "text-anchor": anchor, class: "radar__label" });
    label.append(svg("tspan", { x, dy: "-0.2em" }, axis.label));
    label.append(svg("tspan", { x, dy: "1.3em", class: "radar__level" }, axis.level === null ? "—" : `${axis.level} / ${maxLevel}`));
    root.append(label);
  });

  return root;
}
