'use client';

import type { ReactNode } from 'react';
import { student } from '@/mocks/student';
import { comboMultiplierAt, currentStep } from '../../lessonReducer';
import { useLesson } from '../../LessonProvider';
import { HintButton } from '../HintButton/HintButton';
import { ProgressVine } from '../ProgressVine/ProgressVine';
import styles from './LessonShell.module.css';

export function LessonShell({ children }: { children: ReactNode }) {
  const { script, state } = useLesson();
  const step = currentStep(script, state);

  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <p className={styles.lesson}>{script.title}</p>
            <p className={styles.step}>{step?.title ?? ''}</p>
          </div>

          <div className={styles.meters}>
            <p className={styles.meter} aria-label={`Капель собрано: ${state.drops}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2c4 5 7 8.4 7 12a7 7 0 0 1-14 0c0-3.6 3-7 7-12z" />
              </svg>
              <span className={`${styles.meterValue} num`}>{state.drops}</span>
            </p>

            <p className={styles.streak} aria-label={`Дней подряд: ${student.streakDays}`}>
              <span aria-hidden="true">🔥</span>
              <span className={`${styles.meterValue} num`}>{student.streakDays}</span>
            </p>

            {state.combo >= comboMultiplierAt ? <p className={styles.combo}>комбо ×2</p> : null}

            <HintButton />
          </div>
        </header>

        <ProgressVine />
      </div>

      <main className={styles.stage}>{children}</main>
    </div>
  );
}
