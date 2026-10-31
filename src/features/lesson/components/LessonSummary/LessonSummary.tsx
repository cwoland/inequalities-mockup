'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { now } from '@/lib/clock';
import { Rostik } from '@/features/mascot/Rostik';
import { student } from '@/mocks/student';
import { saveLessonProgress } from '../../lessonProgress';
import { accuracy, starsFor } from '../../lessonReducer';
import {
  buildLessonReport,
  recommendationFor,
} from '../../lessonReport';
import { useLesson } from '../../LessonProvider';
import styles from './LessonSummary.module.css';

export function LessonSummary() {
  const { script, state, dispatch } = useLesson();
  const stars = starsFor(script, state);
  const percent = Math.round(accuracy(state) * 100);
  const totalDrops = student.drops + state.drops;

  const stage =
    totalDrops >= 1500
      ? 'tree'
      : totalDrops >= 500
        ? 'sapling'
        : 'sprout';

  const growthText =
    stage === 'sprout'
      ? `До саженца ещё ${500 - totalDrops} капель`
      : stage === 'sapling'
        ? 'Ростик стал саженцем!'
        : 'Ростик стал деревцем!';

  const report = buildLessonReport(script, state.answers);
  const recommendation = recommendationFor(report);

  useEffect(() => {
    saveLessonProgress(stars, student.streakDays);
  }, [stars]);

  return (
    <section className={styles.summary}>
      <Rostik state="grow" stage={stage} size={140} />

      <h2 className={styles.title}>Грядка зазеленела</h2>
      <p>{growthText}</p>

      <p
        className={styles.stars}
        aria-label={`Звёзд получено: ${stars} из 3`}
      >
        {[1, 2, 3].map((place) => (
          <svg
            key={place}
            className={
              place <= stars ? styles.starOn : styles.starOff
            }
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.6 6.2 20.6l1.1-6.4L2.6 9.6l6.5-.9z" />
          </svg>
        ))}
      </p>

      <dl className={styles.numbers}>
        <div className={styles.cell}>
          <dt>Капель</dt>
          <dd className="num">{state.drops}</dd>
        </div>

        <div className={styles.cell}>
          <dt>Верно с первого раза</dt>
          <dd className="num">{percent}%</dd>
        </div>

        <div className={styles.cell}>
          <dt>Лучшее комбо</dt>
          <dd className="num">{state.bestCombo}</dd>
        </div>
      </dl>

      <div className={styles.reward}>
        <p className={styles.achievementTitle}>
          🪴 Лейка исследователя — в твой сад
        </p>
        <p className={styles.achievementText}>
          За то, что искал все подходящие числа и помогал Ростику.
        </p>
      </div>

      <section className={styles.report} aria-label="Для родителей">
        <h3>Для родителей</h3>
        <p>
          «{script.title}» · {script.grades}
        </p>

        <p className={styles.achievementText}>
          Самостоятельно — с первой попытки без подсказки.
          Решено — верный ответ получен за любую из попыток.
        </p>

        {report.map((skill) => (
          <div key={skill.id}>
            <h4>{skill.title}</h4>

            {skill.attempted === 0 ? (
              <p className={styles.achievementText}>
                Пока нет ответов для оценки.
              </p>
            ) : (
              <>
                <p>
                  Самостоятельно: {skill.independent} из{' '}
                  {skill.attempted}. Решено: {skill.solved} из{' '}
                  {skill.attempted}.
                </p>

                {skill.withHint > 0 ? (
                  <p className={styles.achievementText}>
                    Подсказка использована в заданиях:{' '}
                    {skill.withHint}.
                  </p>
                ) : null}
              </>
            )}
          </div>
        ))}

        <div>
          <h4>Что повторить дома</h4>
          <p>{recommendation}</p>
        </div>

        <p className={styles.achievementText}>
          Это результат одного тренировочного занятия.
          Исследование каплями не входит в оценку навыков.
        </p>
      </section>

      {state.achievements.length === 0 ? null : (
        <ul className={styles.achievements}>
          {state.achievements.map((item) => (
            <li key={item.id} className={styles.achievement}>
              <p className={styles.achievementTitle}>
                {item.title}
              </p>
              <p className={styles.achievementText}>
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={styles.again}
        onClick={() =>
          dispatch({ type: 'restart', at: now() })
        }
      >
        Пройти ещё раз
      </button>

      <Link href="/">К занятиям</Link>
    </section>
  );
}