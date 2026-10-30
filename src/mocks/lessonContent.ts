import type { Task } from '@/features/lesson/types';
import type { Universe } from '@/lib/math/inequality';

const line: Universe = { min: 0, max: 10 };

export const dropLessThanFive: Task = {
    kind: 'dropTest',
    inequality: { boxSide: 'left', shift: 0, relation: 'lt', value: 5, universe: line },
};

export const buildLessThanFive: Task = {
  kind: 'numberLineBuild',
  inequality: { boxSide: 'left', shift: 0, relation: 'lt', value: 5, universe: line },
};

export const dropMoreThanSeven: Task = {
  kind: 'dropTest',
  inequality: { boxSide: 'left', shift: 0, relation: 'gt', value: 7, universe: line },
};

export const buildMoreThanSeven: Task = {
  kind: 'numberLineBuild',
  inequality: { boxSide: 'left', shift: 0, relation: 'gt', value: 7, universe: line },
};

export const discoveryTasks: Task[] = [
  dropLessThanFive,
  buildLessThanFive,
  dropMoreThanSeven,
  buildMoreThanSeven,
];

export const surpriseTasks: Task[] = [
  {
    kind: 'pickNumbers',
    inequality: { boxSide: 'left', shift: 0, relation: 'lt', value: 5, universe: line },
  },
];

export const digitTrapBug: Task = {
  kind: 'findBug',
  question: 'Путаник сравнивал 9 и 11. На каком шаге он сбился?',
  steps: [
    { expression: '9 и 11', note: 'Сравниваем два числа' },
    { expression: '9 — одна цифра, 11 — две цифры', note: 'Смотрим на запись' },
    { expression: '9 больше, чем 1', note: 'Сравниваем первые цифры' },
    { expression: '9 > 11', note: 'Значит, девять больше' },
  ],
  bugIndex: 2,
};

export const oneAnswerBug: Task = {
  kind: 'findBug',
  question: 'Путаник решал □ < 5. На каком шаге он сбился?',
  steps: [
    { expression: '□ < 5', note: 'Ищем, что подходит вместо окошка' },
    { expression: 'подходит 4, ведь 4 < 5', note: 'Проверяем четвёрку' },
    { expression: 'ответ: 4', note: 'Записываем ответ' },
    { expression: 'готово', note: 'Больше проверять нечего' },
  ],
  bugIndex: 2,
};

export const findBugTasks: Task[] = [digitTrapBug, oneAnswerBug];