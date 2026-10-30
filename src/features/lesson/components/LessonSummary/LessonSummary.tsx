import { now } from '@/lib/clock';
import { accuracy, starsFor } from '../../lessonReducer';
import { useLesson } from '../../LessonProvider';
import styles from './LessonSummary.module.css';

export function LessonSummary() {
  const { script, state, dispatch } = useLesson();
  const stars = starsFor(script, state);
  const percent = Math.round(accuracy(state) * 100);

  return (
    <section className={styles.summary}>
      <h2 className={styles.title}>Грядка зазеленела</h2>

      <p className={styles.stars} aria-label={`Звёзд получено: ${stars} из 3`}>
        {[1, 2, 3].map((place) => (
          <svg
            key={place}
            className={place <= stars ? styles.starOn : styles.starOff}
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
          <dt>Точность</dt>
          <dd className="num">{percent}%</dd>
        </div>
        <div className={styles.cell}>
          <dt>Лучшее комбо</dt>
          <dd className="num">{state.bestCombo}</dd>
        </div>
      </dl>

      {state.achievements.length === 0 ? null : (
        <ul className={styles.achievements}>
          {state.achievements.map((item) => (
            <li key={item.id} className={styles.achievement}>
              <p className={styles.achievementTitle}>{item.title}</p>
              <p className={styles.achievementText}>{item.description}</p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={styles.again}
        onClick={() => dispatch({ type: 'restart', at: now() })}
      >
        Пройти ещё раз
      </button>
    </section>
  );
}
