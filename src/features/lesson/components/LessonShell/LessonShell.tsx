'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { student } from '@/mocks/student';
import { comboMultiplierAt, currentStep } from '../../lessonReducer';
import { useLesson } from '../../LessonProvider';
import { useLessonProgress } from '../../useLessonProgress';
import { visibleStreak } from '../../lessonProgress';
import { HintButton } from '../HintButton/HintButton';
import { ProgressVine } from '../ProgressVine/ProgressVine';
import styles from './LessonShell.module.css';

export function LessonShell({ children }: { children: ReactNode }) {
  const { script, state } = useLesson();
  const step = currentStep(script, state);
  const progress = useLessonProgress();
  const streakDays = visibleStreak(progress, student.streakDays);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current;

    if (stage === null) {
      return;
    }

    const feedback = stage.querySelector<HTMLElement>(
      '[data-lesson-feedback]',
    );

    const target =
      state.status === 'feedback' && feedback !== null
        ? feedback
        : stage;

    target.focus();
  }, [state.stepIndex, state.slotIndex, state.status]);

  const stageLabel =
    step?.kind === 'tasks' && state.status !== 'reward'
      ? `${step.title}. Задание ${state.slotIndex + 1} из ${step.slots.length}`
      : state.status === 'reward'
        ? 'Правило и награда'
        : step?.title ?? script.title;

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#lesson-stage">
        Перейти к заданию
      </a>

      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <p className={styles.lesson}>{script.title}</p>
            <h1 className={styles.step}>{step?.title ?? script.title}</h1>
          </div>

          <div className={styles.meters}>
            <p
              className={styles.meter}
              aria-label={`Капель собрано: ${state.drops}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2c4 5 7 8.4 7 12a7 7 0 0 1-14 0c0-3.6 3-7 7-12z" />
              </svg>
              <span className={`${styles.meterValue} num`}>
                {state.drops}
              </span>
            </p>

            <p
              className={styles.streak}
              aria-label={`Дней подряд: ${streakDays}`}
            >
              <span aria-hidden="true">🔥</span>
              <span className={`${styles.meterValue} num`}>
                {streakDays}
              </span>
            </p>

            {state.combo >= comboMultiplierAt ? (
              <p className={styles.combo}>комбо ×2</p>
            ) : null}

            <HintButton />
          </div>
        </header>

        <ProgressVine />
      </div>

      <main
        ref={stageRef}
        id="lesson-stage"
        className={styles.stage}
        tabIndex={-1}
        aria-label={stageLabel}
      >
        {children}
      </main>
    </div>
  );
}