import {
  digitTrapBug,
  discoveryTasks,
  oneAnswerBug,
  surpriseTasks,
} from '@/mocks/lessonContent';
import { achievements } from './achievements';
import type { GeneratedMechanic, LessonScript, Task, TaskSlot } from './types';

function fixedSlots(prefix: string, tasks: readonly Task[]): TaskSlot[] {
  return tasks.map((task, index) => ({
    id: `${prefix}-${index + 1}`,
    source: 'fixed',
    task,
  }));
}

function generatedSlots(
  prefix: string,
  mechanics: readonly GeneratedMechanic[],
  seedBase: number,
): TaskSlot[] {
  return mechanics.map((mechanic, index) => ({
    id: `${prefix}-${index + 1}`,
    source: 'generated',
    mechanic,
    seed: seedBase + index,
  }));
}

export const inequalitiesLesson: LessonScript = {
  slug: 'inequalities',
  title: 'Больше, меньше или равно',
  grades: '3–4 класс',
  steps: [
    {
      kind: 'intro',
      id: 'intro',
      title: 'Грядка Ростика',
      lines: [
        'Привет! Я Ростик.',
        'Это моя грядка. Росток появляется только там, где запись верная.',
        'Вырастим три грядки?',
      ],
      cta: 'Погнали',
    },
    {
      kind: 'tasks',
      id: 'warmup',
      title: 'Кто больше',
      mascotLine: 'Разогреемся. Ставь знак между числами.',
      mode: 'warmup',
      slots: generatedSlots(
        'warmup',
        ['compareQuick', 'compareQuick', 'compareQuick', 'compareQuick', 'compareQuick'],
        101,
      ),
      allowHints: false,
      adaptive: false,
    },
    {
      kind: 'tasks',
      id: 'discovery',
      title: 'Где растёт',
      mascotLine: 'Кидай капли на числа. Где запись верная — вырастет росток.',
      mode: 'discovery',
      slots: fixedSlots('discovery', discoveryTasks),
      allowHints: true,
      adaptive: false,
    },
    {
      kind: 'tasks',
      id: 'balance',
      title: 'Весы',
      mascotLine: 'Положим числа на чаши. Какая перевесит?',
      mode: 'practice',
      slots: generatedSlots('balance', ['balanceSolve', 'balanceSolve', 'balanceSolve'], 201),
      allowHints: true,
      adaptive: false,
    },
    {
      kind: 'tasks',
      id: 'surprise',
      title: 'Сколько же ответов?',
      mascotLine: 'Путаник уверен, что ответ один. Проверь-ка сам.',
      mode: 'discovery',
      slots: [...fixedSlots('surprise', surpriseTasks), { id: 'surprise-bug', source: 'fixed', task: oneAnswerBug }],
      allowHints: true,
      adaptive: false,
      reward: {
        rule: {
          title: 'У неравенства много ответов',
          text: 'Это не одно число, а целый участок грядки. Проверяй все числа, а не первое подходящее.',
        },
        achievement: achievements.allOfThem,
      },
    },
    {
      kind: 'tasks',
      id: 'mix',
      title: 'Тренировка',
      mascotLine: 'Теперь всё вместе. Задания подстроятся под тебя.',
      mode: 'practice',
      slots: [
        ...generatedSlots(
          'mix',
          ['compareQuick', 'pickLine', 'pickNumbers', 'numberLineBuild', 'balanceSolve'],
          301,
        ),
        { id: 'mix-bug', source: 'fixed', task: digitTrapBug },
      ],
      allowHints: true,
      adaptive: true,
    },
    {
      kind: 'tasks',
      id: 'challenge',
      title: 'Ночной ветер',
      mascotLine: 'Три задания без подсказок. Забор может шататься — это не страшно.',
      mode: 'challenge',
      slots: generatedSlots('challenge', ['pickLine', 'pickNumbers', 'numberLineBuild'], 401),
      allowHints: false,
      adaptive: false,
    },
    { kind: 'summary', id: 'summary', title: 'Грядка зазеленела' },
  ],
};