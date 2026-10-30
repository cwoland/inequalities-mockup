import type { Difficulty } from '@/lib/math/generator';
import { achievements } from './achievements';
import { slotMechanic } from './taskFactory';
import type {
  Achievement,
  AnswerLog,
  LessonAction,
  LessonScript,
  LessonState,
  LessonStatus,
  LessonStep,
  TaskSlot,
} from './types';

export const maxAttempts = 3;
export const comboMultiplierAt = 3;
export const comboRainAt = 5;
export const hintsPerLesson = 3;
export const firstTryDrops = 3;
export const plainDrops = 1;
export const stepCleanBonus = 5;
export const lessonBonus = 10;
export const accuracyForSecondStar = 0.7;

function statusForStep(step: LessonStep | undefined): LessonStatus {
  if (step === undefined || step.kind === 'summary') {
    return 'summary';
  }
  return step.kind === 'intro' ? 'intro' : 'playing';
}

export function initialLessonState(script: LessonScript, at = 0): LessonState {
  return {
    stepIndex: 0,
    slotIndex: 0,
    attempt: 1,
    status: statusForStep(script.steps.at(0)),
    drops: 0,
    combo: 0,
    bestCombo: 0,
    streak: 0,
    hintsLeft: hintsPerLesson,
    hintUsed: false,
    difficulty: 1,
    achievements: [],
    answers: [],
    feedback: null,
    taskStartedAt: at,
  };
}

export function currentStep(script: LessonScript, state: LessonState): LessonStep | undefined {
  return script.steps.at(state.stepIndex);
}

export function currentSlot(script: LessonScript, state: LessonState): TaskSlot | undefined {
  const step = currentStep(script, state);
  return step?.kind === 'tasks' ? step.slots.at(state.slotIndex) : undefined;
}

export function mistakesInStep(state: LessonState, stepId: string): number {
  return state.answers.filter((log) => log.stepId === stepId && !log.correct).length;
}

export function accuracy(state: LessonState): number {
  const firstTries = state.answers.filter((log) => log.attempt === 1);
  if (firstTries.length === 0) {
    return 0;
  }
  return firstTries.filter((log) => log.correct).length / firstTries.length;
}

export function starsFor(script: LessonScript, state: LessonState): 1 | 2 | 3 {
  if (accuracy(state) < accuracyForSecondStar) {
    return 1;
  }
  const challenge = script.steps.find((step) => step.kind === 'tasks' && step.mode === 'challenge');
  if (challenge === undefined || mistakesInStep(state, challenge.id) > 0) {
    return 2;
  }
  return 3;
}

function grant(current: readonly Achievement[], earned: readonly Achievement[]): Achievement[] {
  return earned.reduce<Achievement[]>(
    (acc, item) => (acc.some((kept) => kept.id === item.id) ? acc : [...acc, item]),
    [...current],
  );
}

function raise(difficulty: Difficulty): Difficulty {
  return difficulty === 1 ? 2 : 3;
}

function lower(difficulty: Difficulty): Difficulty {
  return difficulty === 3 ? 2 : 1;
}

function dropsFor(attempt: number, usedHint: boolean, combo: number): number {
  const base = attempt === 1 && !usedHint ? firstTryDrops : plainDrops;
  return combo >= comboMultiplierAt ? base * 2 : base;
}

function praiseFor(combo: number): string {
  if (combo >= comboRainAt) {
    return 'Ливень!';
  }
  if (combo >= comboMultiplierAt) {
    return 'Ростик танцует!';
  }
  return 'Верно!';
}

function goToStep(
  script: LessonScript,
  state: LessonState,
  stepIndex: number,
  at: number,
): LessonState {
  const step = script.steps.at(stepIndex);
  const status = statusForStep(step);
  return {
    ...state,
    stepIndex,
    slotIndex: 0,
    attempt: 1,
    hintUsed: false,
    streak: 0,
    status,
    feedback: null,
    taskStartedAt: at,
    drops: status === 'summary' ? state.drops + lessonBonus : state.drops,
  };
}

function recordAnswer(
  script: LessonScript,
  state: LessonState,
  correct: boolean,
  at: number,
): LessonState {
  const step = currentStep(script, state);
  const slot = currentSlot(script, state);
  if (step?.kind !== 'tasks' || slot === undefined || state.status !== 'playing') {
    return state;
  }

  const log: AnswerLog = {
    stepId: step.id,
    taskId: slot.id,
    correct,
    attempt: state.attempt,
    timeMs: Math.max(0, at - state.taskStartedAt),
    usedHint: state.hintUsed,
  };
  const answers = [...state.answers, log];

  if (!correct) {
    const attempt = state.attempt + 1;
    const moveOn = attempt > maxAttempts;
    return {
      ...state,
      status: 'feedback',
      attempt,
      combo: 0,
      streak: 0,
      difficulty: step.adaptive ? lower(state.difficulty) : state.difficulty,
      answers,
      feedback: {
        tone: 'retry',
        title: moveOn ? 'Давай разберём' : 'Почти',
        detail: moveOn ? 'Покажу, как правильно, и пойдём дальше' : 'Попробуй ещё раз',
        drops: 0,
        moveOn,
      },
    };
  }

  const combo = state.combo + 1;
  const drops = dropsFor(state.attempt, state.hintUsed, combo);
  const streak = step.adaptive ? state.streak + 1 : 0;
  const levelUp = streak >= 2;
  const earned = [
    ...(combo >= comboRainAt ? [achievements.downpour] : []),
    ...(slotMechanic(slot) === 'findBug' && state.attempt === 1 ? [achievements.sharpEye] : []),
  ];

  return {
    ...state,
    status: 'feedback',
    combo,
    bestCombo: Math.max(state.bestCombo, combo),
    streak: levelUp ? 0 : streak,
    difficulty: levelUp ? raise(state.difficulty) : state.difficulty,
    drops: state.drops + drops,
    achievements: grant(state.achievements, earned),
    answers,
    feedback: { tone: 'correct', title: praiseFor(combo), detail: null, drops, moveOn: true },
  };
}

function advance(script: LessonScript, state: LessonState, at: number): LessonState {
  const step = currentStep(script, state);
  if (step === undefined || step.kind === 'summary') {
    return state;
  }
  if (step.kind === 'intro' || state.status === 'reward') {
    return goToStep(script, state, state.stepIndex + 1, at);
  }
  if (state.status !== 'feedback' || state.feedback === null) {
    return state;
  }

  if (!state.feedback.moveOn) {
    return { ...state, status: 'playing', feedback: null, taskStartedAt: at };
  }

  const nextSlot = state.slotIndex + 1;
  if (nextSlot < step.slots.length) {
    return {
      ...state,
      status: 'playing',
      slotIndex: nextSlot,
      attempt: 1,
      hintUsed: false,
      feedback: null,
      taskStartedAt: at,
    };
  }

  const finished: LessonState = {
    ...state,
    drops: state.drops + (mistakesInStep(state, step.id) === 0 ? stepCleanBonus : 0),
    achievements:
      step.reward?.achievement === undefined
        ? state.achievements
        : grant(state.achievements, [step.reward.achievement]),
  };

  if (step.reward !== undefined) {
    return { ...finished, status: 'reward', feedback: null };
  }
  return goToStep(script, finished, state.stepIndex + 1, at);
}

function takeHint(script: LessonScript, state: LessonState): LessonState {
  const step = currentStep(script, state);
  if (step?.kind !== 'tasks' || !step.allowHints) {
    return state;
  }
  if (state.status !== 'playing' || state.hintsLeft === 0 || state.hintUsed) {
    return state;
  }
  return { ...state, hintsLeft: state.hintsLeft - 1, hintUsed: true };
}

export function createLessonReducer(script: LessonScript) {
  return function lessonReducer(state: LessonState, action: LessonAction): LessonState {
    switch (action.type) {
      case 'answer':
        return recordAnswer(script, state, action.correct, action.at);
      case 'hint':
        return takeHint(script, state);
      case 'advance':
        return advance(script, state, action.at);
      case 'restart':
        return initialLessonState(script, action.at);
    }
  };
}