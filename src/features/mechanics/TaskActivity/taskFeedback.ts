import type { Task } from '@/features/lesson/types';
import {
  compareNumbers,
  evaluate,
  formatBoxInequality,
  formatExpr,
  holdsFor,
  relationSigns,
  substitute,
  type BoxInequality,
  type Relation,
} from '@/lib/math/inequality';
import { formatSolution, solve } from '@/lib/math/numberLine';

export type AnswerDraft = {
  chosen: number | Relation | null;
  values: readonly number[];
};

const relationNames: Record<Relation, string> = {
  lt: 'меньше',
  gt: 'больше',
  eq: 'равно',
};

function substitutionText(
  inequality: BoxInequality,
  candidate: number,
): string {
  const { left, right } = substitute(inequality, candidate);
  return `${left} ${relationSigns[inequality.relation]} ${right}`;
}

function numbersFeedback(
  inequality: BoxInequality,
  selected: readonly number[],
): string {
  const expected = solve(inequality);
  const extra = selected.find((value) => !holdsFor(inequality, value));

  if (extra !== undefined) {
    return (
      `Проверь число ${extra}: вместо окошка получается ` +
      `${substitutionText(inequality, extra)}. Эта запись неверна. ` +
      'Убери это число и проверь остальные.'
    );
  }

  const missing = expected.values.find((value) => !selected.includes(value));

  if (missing !== undefined) {
    return (
      `Ты пропустил число ${missing}: ` +
      `${substitutionText(inequality, missing)} — верная запись. ` +
      'Нужно найти все подходящие числа.'
    );
  }

  return 'Все подходящие числа найдены!';
}

export function hintFor(task: Task): string {
  switch (task.kind) {
    case 'compareQuick':
      return (
        'Если есть сложение или вычитание, сначала посчитай. ' +
        'Открытая сторона знака смотрит на большее число.'
      );

    case 'balanceSolve':
      return (
        'Посчитай, сколько на каждой чаше. ' +
        'Чаша с большим числом опускается ниже. ' +
        'Если числа равны, весы стоят ровно.'
      );

    case 'dropTest':
      return (
        'Подставь выбранное число в окошко. ' +
        'Если запись верна, появится росток. ' +
        'Проверь числа по обе стороны от границы.'
      );

    case 'numberLineBuild':
      return (
        'Найди первое и последнее подходящие числа. ' +
        'Поставь на них начало и конец забора. ' +
        'Все числа внутри тоже должны подходить.'
      );

    case 'pickLine':
      return (
        'Проверь крайние отмеченные числа на каждой грядке. ' +
        'Нужна грядка, где отмечены все подходящие числа и нет лишних.'
      );

    case 'pickNumbers':
      return (
        'Подставляй числа в окошко по очереди. ' +
        'Отметь каждое число, с которым запись верна. ' +
        'Ноль тоже может подходить.'
      );

    case 'findBug':
      return (
        'Читай шаги сверху вниз. ' +
        'Найди первое неверное рассуждение, ' +
        'даже если дальше из-за него появились другие ошибки.'
      );
  }
}

export function feedbackFor(
  task: Task,
  draft: AnswerDraft,
  reveal: boolean,
): string {
  if (task.kind === 'compareQuick' || task.kind === 'balanceSolve') {
    const pair = task.kind === 'compareQuick' ? task.pair : task;
    const left = evaluate(pair.left);
    const right = evaluate(pair.right);
    const relation = compareNumbers(left, right);
    const calculation =
      `Слева: ${formatExpr(pair.left)} = ${left}. ` +
      `Справа: ${formatExpr(pair.right)} = ${right}.`;

    if (reveal) {
      const balanceText =
        task.kind !== 'balanceSolve'
          ? ''
          : relation === 'eq'
            ? ' Чаши на одном уровне.'
            : relation === 'gt'
              ? ' Левая чаша тяжелее.'
              : ' Правая чаша тяжелее.';

      return (
        `${calculation} Поэтому ${left} ` +
        `${relationSigns[relation]} ${right}.${balanceText}`
      );
    }

    const choice =
      typeof draft.chosen === 'string'
        ? `Ты выбрал «${relationNames[draft.chosen]}». `
        : '';

    return (
      `${choice}${calculation} ` +
      (left === right
        ? 'Получились одинаковые числа. Какой знак это показывает?'
        : 'Какое число больше? Открытая сторона знака смотрит на него.')
    );
  }

  if (task.kind === 'findBug') {
    const firstError = task.steps.at(task.bugIndex);

    if (reveal) {
      return firstError === undefined
        ? 'Проверяй рассуждение с самого начала.'
        : `Первый ошибочный шаг — ${task.bugIndex + 1}: «${firstError.expression}».`;
    }

    if (typeof draft.chosen !== 'number') {
      return hintFor(task);
    }

    const chosenStep = task.steps.at(draft.chosen);

    if (chosenStep === undefined) {
      return hintFor(task);
    }

    return draft.chosen < task.bugIndex
      ? (
          `Шаг ${draft.chosen + 1}: «${chosenStep.expression}» — верный. ` +
          'Продолжай читать и найди, где Путаник впервые сбился.'
        )
      : (
          'До выбранного шага Путаник уже успел ошибиться. ' +
          'Вернись выше и найди первое неверное рассуждение.'
        );
  }

  if (reveal) {
    return (
      `Подходят числа: ${formatSolution(solve(task.inequality))}. ` +
      `С каждым из них запись ${formatBoxInequality(task.inequality)} верна.`
    );
  }

  if (task.kind === 'dropTest') {
    return hintFor(task);
  }

  if (task.kind === 'pickLine') {
    const option =
      typeof draft.chosen === 'number'
        ? task.options.at(draft.chosen)
        : undefined;

    return option === undefined
      ? hintFor(task)
      : numbersFeedback(task.inequality, option.values);
  }

  const feedback = numbersFeedback(task.inequality, draft.values);

  return task.kind === 'numberLineBuild'
    ? `${feedback} Передвинь начало или конец забора.`
    : feedback;
}