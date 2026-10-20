# 構成（アーキテクチャ）

## ファイルの置き場所

```
index.html              画面の骨組み（スタート・出題・結果の3画面）
css/
  variables.css         色・文字・余白などの共通値
  base.css              ページ全体の土台（ヘッダー・余白）
  components.css        画面をまたいで使う部品（カード・ボタン・選択肢）
  screens.css           画面ごとのレイアウト
js/
  main.js               入口。下の部品をつなぐだけ
  config.js             制限時間・問題数・画像などの設定
  data/questions.js     問題データ（解説・スライド画像つき）
  data/areas.js         五角形グラフの5分野と、どの category を入れるか
  core/                 テストの中身（画面に触れない）
    quiz.js             出題・解答・採点
    analysis.js         分野ごとの集計と5段階評価
    timer.js            制限時間のカウントダウン
    shuffle.js          並べ替え
  ui/                   画面の表示（テストの中身は持たない）
    dom.js              画面操作の共通部品
    header.js           ロゴを押したらスタート画面に戻る
    startScreen.js      スタート画面
    quizScreen.js       出題画面（1問ずつ）
    resultScreen.js     結果画面（点数・五角形グラフ・解説）
    radarChart.js       五角形グラフ（SVG）
assets/images/          ロゴ・スマるんの画像
assets/slides/          解説で出すスライド画像
tests/                  自動テスト（npm test）
```

## 役割の分け方

```
config.js / data/questions.js   ← 「何を」出すか（データ）
          │
          ▼
       main.js                  ← つなぎ役（状態を1か所で持つ）
      │       │
      ▼       ▼
   core/     ui/
 中身の計算   画面の表示
```

- **core はブラウザに依存しない**。DOM（画面）に触れないので、Node.js の自動テストでそのまま確かめられる。採点のルールを変えるときは `core/quiz.js` だけを直す。
- **ui は計算をしない**。受け取った値を表示し、ボタンが押されたらコールバックで main.js に知らせるだけ。
- **main.js だけが今の状態（受験中のアテンプト）を持つ**。状態があちこちに散らばらないので、機能を足しても動きを追いやすい。
- `core/quiz.js` の関数は元のデータを書き換えず、新しい値を返す。思わぬところで値が変わるバグを防ぐため。

## 機能を足すときの目安

| 追加したいもの | 置き場所 |
| --- | --- |
| 新しい画面（例：解説画面） | `js/ui/〇〇Screen.js` を作り、`index.html` に section を足し、`main.js` でつなぐ |
| 採点や出題のルール | `js/core/` |
| 新しい設定値 | `js/config.js` |
| 分野の分け方・評価の基準 | `js/data/areas.js`・`js/core/analysis.js` |
| 問題の種類（例：画像つき問題） | `js/data/questions.js` の形を広げ、`tests/questions.test.js` のチェックも合わせて直す |
