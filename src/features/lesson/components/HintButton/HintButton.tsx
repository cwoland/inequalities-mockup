import { currentStep } from '../../lessonReducer';
import { useLesson } from '../../LessonProvider';
import styles from './HintButton.module.css';

export function HintButton() {
  const { script, state, dispatch } = useLesson();
  const step = currentStep(script, state);
  const allowed = step?.kind === 'tasks' && step.allowHints;
  const usable = allowed && state.status === 'playing' && state.hintsLeft > 0 && !state.hintUsed;

  if (!allowed) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.hint}
      onClick={() => dispatch({ type: 'hint' })}
      disabled={!usable}
      aria-label={`Взять росинку-подсказку, осталось ${state.hintsLeft}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2c4 5 7 8.4 7 12a7 7 0 0 1-14 0c0-3.6 3-7 7-12z" />
      </svg>
      <span className={`${styles.count} num`}>{state.hintsLeft}</span>
    </button>
  );
}
