'use client';

import { useId } from 'react';
import { now } from '@/lib/clock';
import { useLesson } from '../../LessonProvider';
import styles from './FeedbackToast.module.css';

export function FeedbackToast() {
  const { state, dispatch } = useLesson();
  const titleId = useId();
  const detailId = useId();
  const feedback = state.feedback;

  if (feedback === null) {
    return null;
  }

  return (
    <section
      className={
        feedback.tone === 'correct' ? styles.correct : styles.retry
      }
      data-lesson-feedback
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={
        feedback.detail === null ? undefined : detailId
      }
    >
      <div className={styles.text}>
        <h2 id={titleId} className={styles.title}>
          {feedback.title}
        </h2>

        {feedback.detail === null ? null : (
          <p id={detailId} className={styles.detail}>
            {feedback.detail}
          </p>
        )}
      </div>

      {feedback.drops > 0 ? (
        <p
          className={`${styles.drops} num`}
          aria-label={`Получено капель: ${feedback.drops}`}
        >
          +{feedback.drops}
        </p>
      ) : null}

      <button
        type="button"
        className={styles.next}
        onClick={() =>
          dispatch({ type: 'advance', at: now() })
        }
      >
        {feedback.moveOn ? 'Дальше' : 'Ещё раз'}
      </button>
    </section>
  );
}