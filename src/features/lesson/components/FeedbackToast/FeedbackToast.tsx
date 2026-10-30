import { now } from '@/lib/clock';
import { useLesson } from '../../LessonProvider';
import styles from './FeedbackToast.module.css';

export function FeedbackToast() {
  const { state, dispatch } = useLesson();
  const feedback = state.feedback;

  if (feedback === null) {
    return null;
  }

  return (
    <div
      className={feedback.tone === 'correct' ? styles.correct : styles.retry}
      role="status"
      aria-live="polite"
    >
      <div className={styles.text}>
        <p className={styles.title}>{feedback.title}</p>
        {feedback.detail === null ? null : <p className={styles.detail}>{feedback.detail}</p>}
      </div>

      {feedback.drops > 0 ? (
        <p className={`${styles.drops} num`} aria-label={`Получено капель: ${feedback.drops}`}>
          +{feedback.drops}
        </p>
      ) : null}

      <button
        type="button"
        className={styles.next}
        onClick={() => dispatch({ type: 'advance', at: now() })}
      >
        {feedback.moveOn ? 'Дальше' : 'Ещё раз'}
      </button>
    </div>
  );
}
