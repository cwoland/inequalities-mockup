import { describe, expect, it } from 'vitest';
import type { Task } from '@/features/lesson/types';
import { feedbackFor, hintFor } from '../taskFeedback';

const numbersTask: Extract<Task, { kind: 'pickNumbers' }> = {
  kind: 'pickNumbers',
  inequality: {
    boxSide: 'left',
    shift: 0,
    relation: 'lt',
    value: 5,
    universe: { min: 0, max: 10 },
  },
};

describe('объяснение ошибок', () => {
  it('показывает лишнее число через подстановку', () => {
    const text = feedbackFor(
      numbersTask,
      { chosen: null, values: [0, 1, 2, 3, 4, 5] },
      false,
    );

    expect(text).toContain('Проверь число 5');
    expect(text).toContain('5 < 5');
    expect(text).toContain('Эта запись неверна');
  });

  it('находит пропущенный ноль', () => {
    const text = feedbackFor(
      numbersTask,
      { chosen: null, values: [1, 2, 3, 4] },
      false,
    );

    expect(text).toContain('Ты пропустил число 0');
    expect(text).toContain('0 < 5');
  });

  it('учитывает окошко справа и вычитание', () => {
    const task: Task = {
      kind: 'pickNumbers',
      inequality: {
        boxSide: 'right',
        shift: -2,
        relation: 'lt',
        value: 3,
        universe: { min: 2, max: 10 },
      },
    };

    const text = feedbackFor(
      task,
      { chosen: null, values: [5, 6, 7, 8, 9, 10] },
      false,
    );

    expect(text).toContain('Проверь число 5');
    expect(text).toContain('3 < 3');
  });

  it('объясняет пропуск числа за пределами забора', () => {
    const task: Task = {
      kind: 'numberLineBuild',
      inequality: numbersTask.inequality,
    };

    const text = feedbackFor(
      task,
      { chosen: null, values: [0, 1, 2, 3] },
      false,
    );

    expect(text).toContain('Ты пропустил число 4');
    expect(text).toContain('Передвинь начало или конец забора');
  });

  it('разбирает выбранную грядку', () => {
    const universe = numbersTask.inequality.universe;

    const task: Task = {
      kind: 'pickLine',
      inequality: numbersTask.inequality,
      options: [
        { universe, values: [0, 1, 2, 3, 4] },
        { universe, values: [0, 1, 2, 3, 4, 5] },
      ],
      correctIndex: 0,
    };

    const text = feedbackFor(
      task,
      { chosen: 1, values: [] },
      false,
    );

    expect(text).toContain('Проверь число 5');
  });

  it('сравнивает результаты выражений', () => {
    const task: Task = {
      kind: 'compareQuick',
      pair: {
        left: { kind: 'add', left: 3, right: 4 },
        right: { kind: 'num', value: 7 },
      },
    };

    const text = feedbackFor(
      task,
      { chosen: 'gt', values: [] },
      false,
    );

    expect(text).toContain('Ты выбрал «больше»');
    expect(text).toContain('3 + 4 = 7');
    expect(text).toContain('одинаковые числа');
  });

  it('на весах объясняет, какая чаша тяжелее', () => {
    const task: Task = {
      kind: 'balanceSolve',
      left: { kind: 'num', value: 9 },
      right: { kind: 'num', value: 4 },
    };

    const text = feedbackFor(
      task,
      { chosen: 'gt', values: [] },
      true,
    );

    expect(text).toContain('9 > 4');
    expect(text).toContain('Левая чаша тяжелее');
  });

  it('отправляет искать ошибку раньше выбранного шага', () => {
    const task: Task = {
      kind: 'findBug',
      question: 'Где первая ошибка?',
      steps: [
        { expression: 'Первый шаг', note: 'Верное рассуждение' },
        { expression: 'Второй шаг', note: 'Ошибка' },
        { expression: 'Третий шаг', note: 'Следствие ошибки' },
      ],
      bugIndex: 1,
    };

    const text = feedbackFor(
      task,
      { chosen: 2, values: [] },
      false,
    );

    expect(text).toContain('Вернись выше');
    expect(text).not.toContain('Второй шаг');
  });

  it('раскрывает полный ответ только в режиме разбора', () => {
    const text = feedbackFor(
      numbersTask,
      { chosen: null, values: [4] },
      true,
    );

    expect(text).toContain('Подходят числа: 0, 1, 2, 3, 4');
  });

  it('подсказка для забора объясняет работу с границами', () => {
    const task: Task = {
      kind: 'numberLineBuild',
      inequality: numbersTask.inequality,
    };

    expect(hintFor(task)).toContain('первое и последнее');
  });
});