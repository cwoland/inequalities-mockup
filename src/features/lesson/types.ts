import type { ComparePair, Difficulty } from '@/lib/math/generator';
import type { BoxInequality, Expr } from '@/lib/math/inequality';
import type { SolutionSet } from '@/lib/math/numberLine';

export type MechanicKind =
  | 'compareQuick'
  | 'dropTest'
  | 'numberLineBuild'
  | 'balanceSolve'
  | 'pickLine'
  | 'pickNumbers'
  | 'findBug';

export type GeneratedMechanic = Exclude<MechanicKind, 'findBug'>;

export type SolutionStep = { expression: string; note: string };

export type Task =
  | { kind: 'compareQuick'; pair: ComparePair }
  | { kind: 'dropTest'; inequality: BoxInequality }
  | { kind: 'numberLineBuild'; inequality: BoxInequality }
  | { kind: 'balanceSolve'; left: Expr; right: Expr }
  | { kind: 'pickLine'; inequality: BoxInequality; options: SolutionSet[]; correctIndex: number }
  | { kind: 'pickNumbers'; inequality: BoxInequality }
  | { kind: 'findBug'; question: string; steps: SolutionStep[]; bugIndex: number };

export type TaskSlot =
  | { id: string; source: 'fixed'; task: Task }
  | { id: string; source: 'generated'; mechanic: GeneratedMechanic; seed: number };

export type Achievement = { id: string; title: string; description: string };

export type StepMode = 'warmup' | 'discovery' | 'practice' | 'challenge';

export type StepReward = {
  rule?: { title: string; text: string };
  achievement?: Achievement;
};

export type IntroStep = {
  kind: 'intro';
  id: string;
  title: string;
  lines: string[];
  cta: string;
};

export type TasksStep = {
  kind: 'tasks';
  id: string;
  title: string;
  mascotLine: string;
  mode: StepMode;
  slots: TaskSlot[];
  allowHints: boolean;
  adaptive: boolean;
  reward?: StepReward;
};

export type SummaryStep = { kind: 'summary'; id: string; title: string };

export type LessonStep = IntroStep | TasksStep | SummaryStep;

export type LessonScript = {
  slug: string;
  title: string;
  grades: string;
  steps: LessonStep[];
};

export type LessonStatus = 'intro' | 'playing' | 'feedback' | 'reward' | 'summary';

export type AnswerLog = {
  stepId: string;
  taskId: string;
  correct: boolean;
  attempt: number;
  timeMs: number;
  usedHint: boolean;
};

export type Feedback = {
  tone: 'correct' | 'retry';
  title: string;
  detail: string | null;
  drops: number;
  moveOn: boolean;
};

export type LessonState = {
  stepIndex: number;
  slotIndex: number;
  attempt: number;
  status: LessonStatus;
  drops: number;
  combo: number;
  bestCombo: number;
  streak: number;
  hintsLeft: number;
  hintUsed: boolean;
  difficulty: Difficulty;
  achievements: Achievement[];
  answers: AnswerLog[];
  feedback: Feedback | null;
  taskStartedAt: number;
};

export type LessonAction =
  | { type: 'answer'; correct: boolean; at: number }
  | { type: 'hint' }
  | { type: 'advance'; at: number }
  | { type: 'restart'; at: number };