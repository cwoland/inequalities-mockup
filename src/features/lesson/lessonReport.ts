import { slotMechanic } from './taskFactory';
import type { AnswerLog, LessonScript, MechanicKind } from './types';

export type SkillReport = {
  id: string;
  title: string;
  attempted: number;
  independent: number;
  solved: number;
  withHint: number;
  recommendation: string;
};

type SkillDefinition = {
  id: string;
  title: string;
  mechanics: readonly MechanicKind[];
  recommendation: string;
};

const skills: readonly SkillDefinition[] = [
  {
    id: 'comparison',
    title: 'Сравнение чисел и выражений',
    mechanics: ['compareQuick', 'balanceSolve'],
    recommendation:
      'Потренируйте сравнение: предложите поставить знак между 8 + 3 и 14 − 2. Сначала посчитайте обе стороны.',
  },
  {
    id: 'solutions',
    title: 'Поиск всех подходящих чисел',
    mechanics: ['pickNumbers', 'pickLine', 'numberLineBuild'],
    recommendation:
      'Предложите найти все целые числа от 0 до 10, которые подходят в окошко: □ < 6. Проверьте, не забыли ли ноль.',
  },
  {
    id: 'reasoning',
    title: 'Проверка рассуждений',
    mechanics: ['findBug'],
    recommendation:
      'Разберите запись «для □ < 5 подходит только 4». Попросите ребёнка проверить числа 0, 1, 2 и 3 и объяснить ошибку.',
  },
];

export function buildLessonReport(
  script: LessonScript,
  answers: readonly AnswerLog[],
): SkillReport[] {
  return skills.map((skill) => {
    let attempted = 0;
    let independent = 0;
    let solved = 0;
    let withHint = 0;

    for (const step of script.steps) {
      if (step.kind !== 'tasks') {
        continue;
      }

      for (const slot of step.slots) {
        if (!skill.mechanics.includes(slotMechanic(slot))) {
          continue;
        }

        const attempts = answers.filter(
          (answer) =>
            answer.stepId === step.id && answer.taskId === slot.id,
        );

        if (attempts.length === 0) {
          continue;
        }

        attempted += 1;

        const first = attempts.find((answer) => answer.attempt === 1);

        if (first?.correct && !first.usedHint) {
          independent += 1;
        }

        if (attempts.some((answer) => answer.correct)) {
          solved += 1;
        }

        if (attempts.some((answer) => answer.usedHint)) {
          withHint += 1;
        }
      }
    }

    return {
      id: skill.id,
      title: skill.title,
      attempted,
      independent,
      solved,
      withHint,
      recommendation: skill.recommendation,
    };
  });
}

export function recommendationFor(
  report: readonly SkillReport[],
): string {
  const measured = report.filter((skill) => skill.attempted > 0);

  if (measured.length === 0) {
    return 'Для отчёта пока недостаточно ответов.';
  }

  const weakest = measured.reduce((current, skill) =>
    skill.independent / skill.attempted <
    current.independent / current.attempted
      ? skill
      : current,
  );

  if (weakest.independent / weakest.attempted < 0.7) {
    return weakest.recommendation;
  }

  return (
    'Для закрепления попросите ребёнка придумать своё неравенство ' +
    'с окошком и найти все подходящие числа на грядке от 0 до 10.'
  );
}