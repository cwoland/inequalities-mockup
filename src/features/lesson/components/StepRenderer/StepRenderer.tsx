'use client';

import { now } from '@/lib/clock';
import type { ReactNode } from 'react';
import { MechanicStub } from '@/features/mechanics/MechanicStub/MechanicStub';
import type { MechanicControl, MechanicPhase } from '@/features/mechanics/types';
import { formatBoxInequality, formatExpr } from '@/lib/math/inequality';
import { formatSolution, solve } from '@/lib/math/numberLine';
import { currentSlot, currentStep } from '../../lessonReducer';
import { useLesson } from '../../LessonProvider';
import { buildTask } from '../../taskFactory';
import type { IntroStep, StepReward, Task } from '../../types';
import { FeedbackToast } from '../FeedbackToast/FeedbackToast';
import { LessonSummary } from '../LessonSummary/LessonSummary';
import styles from './StepRenderer.module.css';

function renderMechanic(task: Task, control: MechanicControl): ReactNode {
  switch (task.kind) {
    case 'compareQuick':
      return (
        <MechanicStub
          label="Сравнение"
          question={`${formatExpr(task.pair.left)} ? ${formatExpr(task.pair.right)}`}
          control={control}
        />
      );
    case 'dropTest':
      return (
        <MechanicStub
          label="Капли на грядку"
          question={formatBoxInequality(task.inequality)}
          answer={formatSolution(solve(task.inequality))}
          control={control}
        />
      );
    case 'numberLineBuild':
      return (
        <MechanicStub
          label="Построй забор"
          question={formatBoxInequality(task.inequality)}
          answer={formatSolution(solve(task.inequality))}
          control={control}
        />
      );
    case 'balanceSolve':
      return (
        <MechanicStub
          label="Весы"
          question={`${formatExpr(task.left)} ? ${formatExpr(task.right)}`}
          control={control}
        />
      );
    case 'pickLine': {
      const right = task.options.at(task.correctIndex);
      return (
        <MechanicStub
          label="Выбери картинку"
          question={formatBoxInequality(task.inequality)}
          answer={right === undefined ? '—' : formatSolution(right)}
          control={control}
        />
      );
    }
    case 'pickNumbers':
      return (
        <MechanicStub
          label="Отметь все подходящие"
          question={formatBoxInequality(task.inequality)}
          answer={formatSolution(solve(task.inequality))}
          control={control}
        />
      );
    case 'findBug':
      return (
        <MechanicStub
          label="Найди ошибку"
          question={task.question}
          answer={`шаг ${task.bugIndex + 1}`}
          control={control}
        />
      );
  }
}

function IntroCard({ step, onStart }: { step: IntroStep; onStart: () => void }) {
  return (
    <section className={styles.card}>
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

function RuleCard({ reward, onNext }: { reward: StepReward; onNext: () => void }) {
  return (
    <section className={styles.rule}>
      <p className={styles.ruleBadge}>Запомни</p>
      <h2 className={styles.cardTitle}>{reward.rule?.title ?? 'Готово'}</h2>
      {reward.rule === undefined ? null : <p className={styles.cardText}>{reward.rule.text}</p>}
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
  const forward = () => dispatch({ type: 'advance', at: now() });

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
          revealed: state.feedback.tone === 'retry' && state.feedback.moveOn,
        }
      : { kind: 'answering', attempt: state.attempt, hintUsed: state.hintUsed };

  const control: MechanicControl = {
    phase,
    onAnswer: (correct) => dispatch({ type: 'answer', correct, at: now() }),
  };

  return (
    <>
      <p className={styles.mascotLine}>{step.mascotLine}</p>
      {renderMechanic(buildTask(slot, state.difficulty), control)}
      <FeedbackToast />
    </>
  );
}
