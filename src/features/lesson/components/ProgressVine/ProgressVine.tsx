import { useLesson } from '../../LessonProvider';
import styles from './ProgressVine.module.css';

export function ProgressVine() {
  const { script, state } = useLesson();
  const workSteps = script.steps.filter((step) => step.kind === 'tasks');
  const currentId = script.steps.at(state.stepIndex)?.id;
  const place = workSteps.findIndex((step) => step.id === currentId);
  const done = place === -1 && state.status === 'summary' ? workSteps.length : Math.max(0, place);

  return (
    <div className={styles.vine}>
      <ol className={styles.leaves}>
        {workSteps.map((step, index) => (
          <li
            key={step.id}
            className={
              index < done ? styles.leafDone : index === place ? styles.leafNow : styles.leafNext
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 3C9.4 3 3 9.4 3 21 14.6 21 21 14.6 21 3z" />
              <path className={styles.vein} d="M20 4 8 16" />
            </svg>
          </li>
        ))}
      </ol>
      <p className={styles.caption}>
        {state.status === 'summary'
          ? 'Все грядки зелёные'
          : `Шаг ${Math.min(done + 1, workSteps.length)} из ${workSteps.length}`}
      </p>
    </div>
  );
}
