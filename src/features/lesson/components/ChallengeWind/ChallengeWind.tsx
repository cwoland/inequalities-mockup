'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ChallengeWind.module.css';

const durationMs = 90_000;

export function ChallengeWind({
  running,
  mistakes,
}: {
  running: boolean;
  mistakes: number;
}) {
  const remainingMs = useRef(durationMs);
  const [secondsLeft, setSecondsLeft] = useState(durationMs / 1000);
  const expired = secondsLeft === 0;

  useEffect(() => {
    if (!running || expired) {
      return;
    }

    let lastTick: number | null = document.hidden
      ? null
      : performance.now();

    const updateRemaining = () => {
      const current = performance.now();

      if (lastTick !== null) {
        remainingMs.current = Math.max(
          0,
          remainingMs.current - (current - lastTick),
        );
      }

      lastTick = document.hidden ? null : current;
    };

    const tick = () => {
      updateRemaining();

      const seconds = Math.ceil(remainingMs.current / 1000);
      setSecondsLeft(seconds);

      if (seconds === 0) {
        window.clearInterval(interval);
      }
    };

    const interval = window.setInterval(tick, 250);

    document.addEventListener('visibilitychange', tick);

    return () => {
      updateRemaining();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [running, expired]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  const strength =
    secondsLeft > 60 ? 'calm' : secondsLeft > 30 ? 'breeze' : 'gust';

  const message = expired
    ? 'Ветер разгулялся! Продолжай в своём темпе — времени хватит.'
    : !running
      ? 'Разбираемся спокойно. Пока читаешь объяснение, время не идёт.'
      : secondsLeft <= 30
        ? 'Ветер усиливается. Не торопись: важнее внимательно проверить числа.'
        : 'Помоги грядке устоять. Даже если ошибёшься, можно попробовать ещё раз.';

  return (
    <section
      className={styles.panel}
      data-strength={strength}
      data-paused={!running || expired}
      aria-label="Испытание «Ночной ветер»"
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Последняя грядка</p>
          <h2 className={styles.title}>Ночной ветер</h2>
        </div>

        <div className={styles.clock}>
          <span className={styles.clockLabel}>
            {expired ? 'Продолжаем' : 'Ориентир'}
          </span>
          <span
            className={`${styles.time} num`}
            role="timer"
            aria-live="off"
            aria-label={`Осталось ${secondsLeft} секунд`}
          >
            {minutes}:{seconds}
          </span>
        </div>
      </div>

      <div className={styles.landscape} aria-hidden="true">
        <span className={styles.moon} />

        <svg
          className={styles.wind}
          viewBox="0 0 600 72"
          preserveAspectRatio="none"
        >
          <path d="M10 19H170Q192 19 192 8" />
          <path d="M240 36H430Q455 36 455 20" />
          <path d="M55 54H280Q307 54 307 65" />
          <path d="M470 58H590" />
        </svg>

        <div
          key={mistakes}
          className={`${styles.fence} ${
            mistakes > 0 ? styles.shaking : ''
          }`}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((post) => (
            <span key={post} className={styles.post} />
          ))}
        </div>

        <div className={styles.ground} />
      </div>

      <p className={styles.message} role="status">
        {message}
      </p>
    </section>
  );
}