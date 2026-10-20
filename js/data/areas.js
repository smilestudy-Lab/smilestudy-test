// 結果画面の五角形グラフで使う「5つの分野」。
// 問題の category を、どの分野に入れるかをここで決める。
// 新しい category を作ったら、どれか1つの分野の categories に足す（npm test でチェックされる）。

export const AREAS = [
  { id: "philosophy", label: "理念・指導方針", categories: ["理念・MVV", "授業体制"] },
  { id: "schedule", label: "日程・カレンダー", categories: ["時間割", "予約サイクル", "カレンダー登録", "お知らせ作成"] },
  { id: "lesson", label: "授業・報告書", categories: ["全体の流れ", "準備報告と授業", "指導報告書"] },
  { id: "tools", label: "ツール・Slack", categories: ["ツール", "ツールとSlack文化"] },
  { id: "rules", label: "欠席・連絡ルール", categories: ["欠席と振替", "日程変更", "連絡ルール"] },
];
