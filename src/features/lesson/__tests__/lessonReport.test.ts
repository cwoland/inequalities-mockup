import { describe, expect, it } from 'vitest';
import { buildLessonReport, recommendationFor } from '../lessonReport';
import type { AnswerLog, LessonScript } from '../types';

const script: LessonScript = {
  slug: 'report-test',
  title: 'Тест отчёта',
  grades: '3 класс',
  steps: [
    {
      kind: 'tasks',
      id: 'practice',
      title: 'Практика',
      mascotLine: '',
      mode: 'practice',
      allowHints: true,
      adaptive: false,
      slots: [
        {
          id: 'compare',
          source: 'generated',
          mechanic: 'compareQuick',
          seed: 1,
        },
        {
          id: 'numbers',
          source: 'generated',
          mechanic: 'pickNumbers',
          seed: 2,
        },
        {
          id: 'drops',
          source: 'generated',
          mechanic: 'dropTest',
          seed: 3,
        },
      ],
    },
  ],
};

function answer(
  taskId: string,
  correct: boolean,
  attempt = 1,
  usedHint = false,
): AnswerLog {
  return {
    stepId: 'practice',
    taskId,
    correct,
    attempt,
    usedHint,
    timeMs: 1000,
  };
}

describe('отчёт по навыкам', () => {
  it('не считает повторные попытки отдельными заданиями', () => {
    const report = buildLessonReport(script, [
      answer('numbers', false),
      answer('numbers', true, 2),
    ]);

    expect(report.find((skill) => skill.id === 'solutions')).toMatchObject({
      attempted: 1,
      independent: 0,
      solved: 1,
      withHint: 0,
    });
  });

  it('отделяет ответ с подсказкой от самостоятельного', () => {
    const report = buildLessonReport(script, [
      answer('compare', true, 1, true),
    ]);

    expect(report.find((skill) => skill.id === 'comparison')).toMatchObject({
      attempted: 1,
      independent: 0,
      solved: 1,
      withHint: 1,
    });
  });

  it('учитывает верный ответ без подсказки с первой попытки', () => {
    const report = buildLessonReport(script, [
      answer('compare', true),
    ]);

    expect(report.find((skill) => skill.id === 'comparison')).toMatchObject({
      attempted: 1,
      independent: 1,
      solved: 1,
    });
  });

  it('исключает исследование каплями', () => {
    const report = buildLessonReport(script, [
      answer('drops', true),
    ]);

    expect(report.every((skill) => skill.attempted === 0)).toBe(true);
  });

  it('не считает неотвеченные задания ошибками', () => {
    const report = buildLessonReport(script, []);

    expect(report.every((skill) => skill.attempted === 0)).toBe(true);
    expect(recommendationFor(report)).toBe(
      'Для отчёта пока недостаточно ответов.',
    );
  });

  it('не принимает журнал другого шага за ответ на задание', () => {
    const report = buildLessonReport(script, [
      { ...answer('compare', true), stepId: 'another-step' },
    ]);

    expect(report.every((skill) => skill.attempted === 0)).toBe(true);
  });

  it('рекомендует повторить навык с худшим результатом', () => {
    const report = buildLessonReport(script, [
      answer('compare', true),
      answer('numbers', false),
      answer('numbers', true, 2),
    ]);

    expect(recommendationFor(report)).toContain('□ < 6');
  });
});