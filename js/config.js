// アプリ全体の設定値。数値や文言を変えたいときはここだけを直す。
export const CONFIG = Object.freeze({
  appTitle: "スマイルスタディ 講師研修テスト",
  // 制限時間（秒）
  timeLimitSec: 10 * 60,
  // 残り時間がこの秒数を切ったらタイマーを警告色にする
  warnAtSec: 60,
  // 答えを選んでから次の問題に進むまでの時間（ミリ秒）
  autoAdvanceMs: 450,
  // 出題する問題数（問題データの件数より多い値は自動で切り詰める）
  questionCount: 44,
  // 毎回の出題順・選択肢の順番をシャッフルするか
  shuffleQuestions: true,
  shuffleChoices: true,
  images: {
    logoLockup: "assets/images/logo-lockup.jpg",
    // スマるん（研修動画のナビゲーター）。腰から上はスタート画面、顔は結果画面で使う
    characterUpper: "assets/images/smarun-waist.jpg",
    characterFace: "assets/images/smarun-face.jpg",
    // 画像が読めなかったときに代わりに出す画像（「〇〇Fallback」の名前で対応づく）
    characterUpperFallback: "assets/images/logo-mark.jpg",
    characterFaceFallback: "assets/images/logo-mark.jpg",
  },
});
