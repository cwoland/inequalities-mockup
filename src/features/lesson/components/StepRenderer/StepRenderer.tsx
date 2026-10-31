'use client';

import { now } from '@/lib/clock';
import { TaskActivity } from '@/features/mechanics/TaskActivity/TaskActivity';
import { Rostik } from '@/features/mascot/Rostik';
import type {
  MechanicControl,
  MechanicPhase,
} from '@/features/mechanics/types';
import { currentSlot, currentStep } from '../../lessonReducer';
import { useLesson } from '../../LessonProvider';
import type { IntroStep, StepReward } from '../../types';
import { ChallengeWind } from '../ChallengeWind/ChallengeWind';
import { FeedbackToast } from '../FeedbackToast/FeedbackToast';
import { LessonSummary } from '../LessonSummary/LessonSummary';
import styles from './StepRenderer.module.css';

function IntroCard({
  step,
  onStart,
}: {
  step: IntroStep;
  onStart: () => void;
}) {
  return (
    <section className={styles.card}>
      <Rostik size={140} />
      <h2 className={styles.cardTitle}>{step.title}</h2>

      {step.lines.map((line) => (
        <p key={line} className={styles.cardText}>
          {line}
        </p>
      ))}

      <button type="button" className={styles.cta} onClick={onStart}>
        {step.cta}
      </button>
    </section>
  );
}

function RuleCard({
  reward,
  onNext,
}: {
  reward: StepReward;
  onNext: () => void;
}) {
  return (
    <section className={styles.rule}>
      <p className={styles.ruleBadge}>Запомни</p>
      <h2 className={styles.cardTitle}>
        {reward.rule?.title ?? 'Готово'}
      </h2>

      {reward.rule === undefined ? null : (
        <p className={styles.cardText}>{reward.rule.text}</p>
      )}

      {reward.achievement === undefined ? null : (
        <p className={styles.ruleAchievement}>
          Новая ачивка: <strong>{reward.achievement.title}</strong>
        </p>
      )}

      <button type="button" className={styles.cta} onClick={onNext}>
        Дальше
      </button>
    </section>
  );
}

export function StepRenderer() {
  const { script, state, dispatch } = useLesson();
  const step = currentStep(script, state);

  const forward = () => {
    dispatch({ type: 'advance', at: now() });
  };

  if (step === undefined || step.kind === 'summary') {
    return <LessonSummary />;
  }

  if (step.kind === 'intro') {
    return <IntroCard step={step} onStart={forward} />;
  }

  if (state.status === 'reward' && step.reward !== undefined) {
    return <RuleCard reward={step.reward} onNext={forward} />;
  }

  const slot = currentSlot(script, state);

  if (slot === undefined) {
    return <LessonSummary />;
  }

  const phase: MechanicPhase =
    state.status === 'feedback' && state.feedback !== null
      ? {
          kind: 'review',
          correct: state.feedback.tone === 'correct',
          revealed:
            state.feedback.tone === 'retry' && state.feedback.moveOn,
        }
      : {
          kind: 'answering',
          attempt: state.attempt,
          hintUsed: state.hintUsed,
        };

  const control: MechanicControl = {
    phase,
    onAnswer: (correct) => {
      dispatch({ type: 'answer', correct, at: now() });
    },
  };

  const mistakes = state.answers.filter(
    (answer) => answer.stepId === step.id && !answer.correct,
  ).length;

  return (
    <>
      <div className={styles.mascotLine}>
        <Rostik
          state={
            state.combo >= 3
              ? 'dance'
              : state.status === 'feedback'
                ? state.feedback?.tone === 'correct'
                  ? 'happy'
                  : 'oops'
                : state.hintUsed
                  ? 'thinking'
                  : 'idle'
          }
          size={88}
        />
        <p>{step.mascotLine}</p>
      </div>

      {step.mode === 'challenge' ? (
        <ChallengeWind
          key={step.id}
          running={state.status === 'playing'}
          mistakes={mistakes}
        />
      ) : null}

      <p className={styles.taskCount}>
        Задание {state.slotIndex + 1} из {step.slots.length}
      </p>

      <TaskActivity
        key={slot.id}
        slot={slot}
        difficulty={state.difficulty}
        control={control}
      />

      <FeedbackToast />
    </>
  );
}