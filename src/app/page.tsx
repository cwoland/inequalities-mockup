'use client';

import Link from 'next/link';
import { useLessonProgress } from '@/features/lesson/useLessonProgress';
import { visibleStreak } from '@/features/lesson/lessonProgress';
import { lessons } from '@/mocks/lessons';
import { stageLabels, student } from '@/mocks/student';
import styles from './page.module.css';

function Stars({ earned }: { earned: number }) {
  return (
    <span className={styles.stars} aria-label={`Звёзд получено: ${earned} из 3`}>
      {[0, 1, 2].map((index) => (
        <svg
          key={index}
          className={index < earned ? styles.starOn : styles.starOff}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.6 6.2 20.6l1.1-6.4L2.6 9.6l6.5-.9z" />
        </svg>
      ))}
    </span>
  );
}

export default function HomePage() {
  const progress = useLessonProgress();
  const streakDays = visibleStreak(progress, student.streakDays);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.hello}>Привет, {student.name}!</p>
          <p className={styles.helloSub}>
            {student.grade} класс · {stageLabels[student.stage]}
          </p>
        </div>
        <ul className={styles.counters}>
          <li className={styles.counter}>
            <span className={`${styles.counterValue} num`}>{streakDays}</span>
            <span className={styles.counterLabel}>дней подряд</span>
          </li>
        </ul>
      </header>

      <h1 className={styles.title}>Занятия</h1>

      <ul className={styles.grid}>
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <article className={lesson.available ? styles.card : styles.cardLocked}>
              <p className={styles.badge}>{lesson.grades}</p>
              <h2 className={styles.cardTitle}>{lesson.title}</h2>
              <p className={styles.cardText}>{lesson.subtitle}</p>
              {lesson.slug === 'inequalities' && progress !== null ? (
                <p className={styles.badge}>В твоем саду: {progress.gardenItem}</p>
              ) : null}
              <div className={styles.cardFoot}>
                <Stars earned={
                  lesson.slug === 'inequalities' && progress !== null
                    ? progress.bestStars
                    : lesson.stars
                } />
                <span className={`${styles.minutes} num`}>{lesson.minutes} мин.</span>
              </div>

              {lesson.available ? (
                <Link className={styles.cta} href={`/lesson/${lesson.slug}`}>
                  {lesson.slug === 'inequalities' && progress !== null 
                    ? 'Пройти ещё раз'
                    : 'Начать'}
                </Link>
              ) : (
                <span className={styles.ctaLocked} aria-disabled="true">
                  Скоро
                </span>
              )}
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
