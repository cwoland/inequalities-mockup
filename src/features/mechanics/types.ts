import type { Task } from '@/features/lesson/types';

export type MechanicPhase =
  | { kind: 'answering'; attempt: number; hintUsed: boolean }
  | { kind: 'review'; correct: boolean; revealed: boolean };

export type MechanicControl = {
  phase: MechanicPhase;
  onAnswer: (correct: boolean) => void;
};

export type MechanicView = {
  task: Task;
  control: MechanicControl;
};
