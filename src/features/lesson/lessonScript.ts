import {
  digitTrapBug,
  discoveryTasks,
  oneAnswerBug,
  surpriseTasks,
} from '@/mocks/lessonContent';
import { achievements } from './achievements';
import type {
  GeneratedMechanic,
  LessonScript,
  Task,
  TaskSlot,
} from './types';

function fixedSlots(
  prefix: string,
  tasks: readonly Task[],
): TaskSlot[] {
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
  grades: '3 класс',
  steps: [
    {
      kind: 'intro',
      id: 'intro',
      title: 'Грядка Ростика',
      lines: [
        'Привет! Я Ростик. Поможешь вырастить мою грядку?',
        'Сначала сравним числа с помощью знаков <, > и =.',
        'Потом будем подставлять числа в окошко. Где запись верна — появится росток.',
      ],
      cta: 'Начать',
    },
    {
      kind: 'tasks',
      id: 'warmup',
      title: 'Кто больше',
      mascotLine:
        'Выбери знак: меньше, больше или равно.',
      mode: 'warmup',
      slots: generatedSlots(
        'warmup',
        [
          'compareQuick',
          'compareQuick',
          'compareQuick',
          'compareQuick',
          'compareQuick',
        ],
        101,
      ),
      allowHints: false,
      adaptive: false,
    },
    {
      kind: 'tasks',
      id: 'discovery',
      title: 'Где растёт',
      mascotLine:
        'Подставляй числа в окошко. Где запись верна — растёт росток. Затем огороди все подходящие числа.',
      mode: 'discovery',
      slots: fixedSlots('discovery', discoveryTasks),
      allowHints: true,
      adaptive: false,
    },
    {
      kind: 'tasks',
      id: 'balance',
      title: 'Весы',
      mascotLine:
        'Сравни числа на чашах. Если числа равны, весы будут стоять ровно.',
      mode: 'practice',
      slots: generatedSlots(
        'balance',
        ['balanceSolve', 'balanceSolve', 'balanceSolve'],
        201,
      ),
      allowHints: true,
      adaptive: false,
    },
    {
      kind: 'tasks',
      id: 'surprise',
      title: 'Сколько же ответов?',
      mascotLine:
        'Путаник нашёл одно число и остановился. Проверь, есть ли другие подходящие числа.',
      mode: 'discovery',
      slots: [
        ...fixedSlots('surprise', surpriseTasks),
        {
          id: 'surprise-bug',
          source: 'fixed',
          task: oneAnswerBug,
        },
      ],
      allowHints: true,
      adaptive: false,
      reward: {
        rule: {
          title: 'Ответов может быть несколько',
          text:
            'Для □ < 5 на нашей грядке подходят 0, 1, 2, 3 и 4. ' +
            'Число 5 не подходит: оно равно 5, а не меньше. ' +
            'Если нужно найти все ответы, не останавливайся на первом.',
        },
        achievement: achievements.allOfThem,
      },
    },
    {
      kind: 'tasks',
      id: 'mix',
      title: 'Тренировка',
      mascotLine:
        'Теперь потренируемся вместе: сравнивай, выбирай числа и проверяй рассуждения.',
      mode: 'practice',
      slots: [
        ...generatedSlots(
          'mix',
          [
            'compareQuick',
            'pickLine',
            'pickNumbers',
            'numberLineBuild',
            'balanceSolve',
          ],
          301,
        ),
        {
          id: 'mix-bug',
          source: 'fixed',
          task: digitTrapBug,
        },
      ],
      allowHints: true,
      adaptive: true,
    },
    {
      kind: 'tasks',
      id: 'challenge',
      title: 'Ночной ветер',
      mascotLine:
        'Три задания без росинок-подсказок. Проверяй внимательно. Если ошибёшься — попробуем ещё раз.',
      mode: 'challenge',
      slots: generatedSlots(
        'challenge',
        ['pickLine', 'pickNumbers', 'numberLineBuild'],
        401,
      ),
      allowHints: false,
      adaptive: false,
    },
    {
      kind: 'summary',
      id: 'summary',
      title: 'Грядка зазеленела',
    },
  ],
};