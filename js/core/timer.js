// 制限時間のカウントダウン。画面には触れず、残り秒数をコールバックで知らせる。

/**
 * @param {{durationSec:number, onTick:(remainingSec:number) => void, onExpire:() => void, now?:() => number}} params
 */
export function createCountdown({ durationSec, onTick, onExpire, now = Date.now }) {
  let endAt = 0;
  let intervalId = null;

  // setInterval のずれが積み重ならないよう、毎回「終了時刻との差」から残りを計算する
  function remainingSec() {
    return Math.max(0, Math.ceil((endAt - now()) / 1000));
  }

  function tick() {
    const remaining = remainingSec();
    onTick(remaining);
    if (remaining === 0) {
      stop();
      onExpire();
    }
  }

  function start() {
    stop();
    endAt = now() + durationSec * 1000;
    onTick(durationSec);
    intervalId = setInterval(tick, 250);
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return { start, stop, remainingSec };
}

/** 秒数を「m:ss」の形にする */
export function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
