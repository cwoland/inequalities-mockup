import {
  generateBoxInequality,
  generateComparePair,
  generateLineOptions,
  type Difficulty,
} from '@/lib/math/generator';
import type { MechanicKind, Task, TaskSlot } from './types';

export function slotMechanic(slot: TaskSlot): MechanicKind {
  return slot.source === 'fixed' ? slot.task.kind : slot.mechanic;
}

export function buildTask(slot: TaskSlot, difficulty: Difficulty): Task {
  if (slot.source === 'fixed') {
    return slot.task;
  }

  const input = { seed: slot.seed, difficulty };

  switch (slot.mechanic) {
    case 'compareQuick':
      return { kind: 'compareQuick', pair: generateComparePair(input) };
    case 'dropTest':
      return { kind: 'dropTest', inequality: generateBoxInequality(input) };
    case 'numberLineBuild':
      return { kind: 'numberLineBuild', inequality: generateBoxInequality(input) };
    case 'balanceSolve': {
      const pair = generateComparePair(input);
      return { kind: 'balanceSolve', left: pair.left, right: pair.right };
    }
    case 'pickLine':
      return { kind: 'pickLine', ...generateLineOptions(input) };
    case 'pickNumbers':
      return { kind: 'pickNumbers', inequality: generateBoxInequality(input) };
  }
}