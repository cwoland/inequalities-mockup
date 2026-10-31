import type { Task } from '@/features/lesson/types';
import type { Universe } from '@/lib/math/inequality';

const line: Universe = { min: 0, max: 10 };

export const dropLessThanFive: Task = {
  kind: 'dropTest',
  inequality: {
    boxSide: 'left',
    shift: 0,
    relation: 'lt',
    value: 5,
    universe: line,
  },
};

export const buildLessThanFive: Task = {
  kind: 'numberLineBuild',
  inequality: {
    boxSide: 'left',
    shift: 0,
    relation: 'lt',
    value: 5,
    universe: line,
  },
};

export const dropMoreThanSeven: Task = {
  kind: 'dropTest',
  inequality: {
    boxSide: 'left',
    shift: 0,
    relation: 'gt',
    value: 7,
    universe: line,
  },
};

export const buildMoreThanSeven: Task = {
  kind: 'numberLineBuild',
  inequality: {
    boxSide: 'left',
    shift: 0,
    relation: 'gt',
    value: 7,
    universe: line,
  },
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
    inequality: {
      boxSide: 'left',
      shift: 0,
      relation: 'lt',
      value: 5,
      universe: line,
    },
  },
];

export const digitTrapBug: Task = {
  kind: 'findBug',
  question:
    'Путаник сравнивает 9 и 11. Найди первый ошибочный шаг.',
  steps: [
    {
      expression: 'Сравниваю числа 9 и 11',
      note: 'Смотрю на оба числа',
    },
    {
      expression: 'В записи 9 одна цифра, а в записи 11 — две',
      note: 'Считаю цифры',
    },
    {
      expression: '9 > 11, потому что 9 > 1',
      note: 'Делаю вывод по первым цифрам',
    },
    {
      expression: 'Значит, девять больше одиннадцати',
      note: 'Записываю ответ',
    },
  ],
  bugIndex: 2,
};

export const oneAnswerBug: Task = {
  kind: 'findBug',
  question:
    'Путаник ищет все числа от 0 до 10 для □ < 5. Найди первый ошибочный шаг.',
  steps: [
    {
      expression: 'Нужно найти все числа, которые меньше 5',
      note: 'Читаю задание',
    },
    {
      expression: 'Число 4 подходит: 4 < 5',
      note: 'Проверяю четвёрку',
    },
    {
      expression: 'Подходит только число 4',
      note: 'Считаю, что нашёл все ответы',
    },
    {
      expression: 'Другие числа проверять не буду',
      note: 'Заканчиваю поиск',
    },
  ],
  bugIndex: 2,
};

export const findBugTasks: Task[] = [
  digitTrapBug,
  oneAnswerBug,
];