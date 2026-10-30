import type { MechanicControl } from '../types';
import styles from './MechanicStub.module.css';

export function MechanicStub({
  label,
  question,
  answer,
  control,
}: {
  label: string;
  question: string;
  answer?: string;
  control: MechanicControl;
}) {
  const { phase, onAnswer } = control;

  return (
    <section className={styles.stub}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.question} num`}>{question}</p>

      {answer === undefined ? null : (
        <p className={styles.answer}>
          ожидаемый ответ: <span className="num">{answer}</span>
        </p>
      )}

      {phase.kind === 'answering' ? (
        <>
          {phase.hintUsed ? (
            <p className={styles.hinted}>Росинка взята — разбор механики будет здесь</p>
          ) : null}
          <div className={styles.buttons}>
            <button type="button" className={styles.right} onClick={() => onAnswer(true)}>
              Ответить верно
            </button>
            <button type="button" className={styles.wrong} onClick={() => onAnswer(false)}>
              Ответить неверно
            </button>
          </div>
          <p className={styles.attempt}>попытка {phase.attempt}</p>
        </>
      ) : (
        <p className={styles.review}>
          {phase.correct
            ? 'Здесь механика покажет выросший росток'
            : phase.revealed
              ? 'Здесь механика раскроет правильный ответ'
              : 'Здесь механика подсветит, что именно не сошлось'}
        </p>
      )}
    </section>
  );
}
