import { describe, expect, it } from 'vitest';
import { achievements } from '../achievements';
import {
  accuracy,
  createLessonReducer,
  currentSlot,
  currentStep,
  hintsPerLesson,
  initialLessonState,
  lessonBonus,
  mistakesInStep,
  starsFor,
  stepCleanBonus,
} from '../lessonReducer';
import { inequalitiesLesson } from '../lessonScript';
import type { LessonAction, LessonScript, LessonState } from '../types';

const answerRight = (at = 1000): LessonAction => ({ type: 'answer', correct: true, at });
const answerWrong = (at = 1000): LessonAction => ({ type: 'answer', correct: false, at });
const forward = (at = 1100): LessonAction => ({ type: 'advance', at });
const askHint = (): LessonAction => ({ type: 'hint' });

function play(script: LessonScript, actions: readonly LessonAction[]): LessonState {
  const reducer = createLessonReducer(script);
  return actions.reduce(reducer, initialLessonState(script, 0));
}

function solveSlot(times = 1): LessonAction[] {
  return Array.from({ length: times }, () => [answerRight(), forward()]).flat();
}

const simple: LessonScript = {
  slug: 'simple',
  title: 'Простой',
  grades: 'тест',
  steps: [
    { kind: 'intro', id: 'intro', title: 'Привет', lines: ['раз'], cta: 'Дальше' },
    {
      kind: 'tasks',
      id: 'first',
      title: 'Первый',
      mascotLine: '',
      mode: 'practice',
      slots: [
        { id: 'a', source: 'generated', mechanic: 'compareQuick', seed: 1 },
        { id: 'b', source: 'generated', mechanic: 'compareQuick', seed: 2 },
      ],
      allowHints: true,
      adaptive: false,
    },
    { kind: 'summary', id: 'summary', title: 'Готово' },
  ],
};

const adaptive: LessonScript = {
  ...simple,
  steps: [
    { kind: 'intro', id: 'intro', title: 'Привет', lines: [], cta: 'Дальше' },
    {
      kind: 'tasks',
      id: 'mix',
      title: 'Микс',
      mascotLine: '',
      mode: 'practice',
      slots: Array.from({ length: 6 }, (_, index) => ({
        id: `m${index}`,
        source: 'generated' as const,
        mechanic: 'pickLine' as const,
        seed: 500 + index,
      })),
      allowHints: true,
      adaptive: true,
    },
    { kind: 'summary', id: 'summary', title: 'Готово' },
  ],
};

describe('начальное состояние', () => {
  it('открывается на интро с полным запасом подсказок', () => {
    const state = initialLessonState(simple, 0);
    expect(state.status).toBe('intro');
    expect(state.drops).toBe(0);
    expect(state.hintsLeft).toBe(hintsPerLesson);
    expect(state.difficulty).toBe(1);
    expect(state.answers).toEqual([]);
  });
});

describe('движение по шагам', () => {
  it('с интро уходит на первое задание', () => {
    const state = play(simple, [forward()]);
    expect(state.status).toBe('playing');
    expect(currentStep(simple, state)?.id).toBe('first');
    expect(currentSlot(simple, state)?.id).toBe('a');
  });

  it('верный ответ показывает фидбек, а не следующее задание', () => {
    const state = play(simple, [forward(), answerRight()]);
    expect(state.status).toBe('feedback');
    expect(state.feedback?.tone).toBe('correct');
    expect(currentSlot(simple, state)?.id).toBe('a');
  });

  it('после фидбека переходит к следующему слоту', () => {
    const state = play(simple, [forward(), answerRight(), forward()]);
    expect(state.status).toBe('playing');
    expect(currentSlot(simple, state)?.id).toBe('b');
    expect(state.attempt).toBe(1);
  });

  it('доходит до финала и выдаёт бонус за урок', () => {
    const state = play(simple, [forward(), ...solveSlot(2)]);
    expect(state.status).toBe('summary');
    expect(state.drops).toBe(3 + 3 + stepCleanBonus + lessonBonus);
  });

  it('из финала дальше не уходит', () => {
    const state = play(simple, [forward(), ...solveSlot(2), forward(), forward()]);
    expect(state.status).toBe('summary');
    expect(state.stepIndex).toBe(2);
  });
});

describe('капли', () => {
  it('три за первую попытку, одна за повторную', () => {
    const first = play(simple, [forward(), answerRight()]);
    expect(first.drops).toBe(3);

    const second = play(simple, [forward(), answerWrong(), forward(), answerRight()]);
    expect(second.drops).toBe(1);
  });

  it('подсказка снимает бонус за первую попытку', () => {
    const state = play(simple, [forward(), askHint(), answerRight()]);
    expect(state.drops).toBe(1);
    expect(state.hintsLeft).toBe(hintsPerLesson - 1);
  });

  it('удваиваются с третьего верного подряд', () => {
    const state = play(adaptive, [forward(), ...solveSlot(3)]);
    expect(state.drops).toBe(3 + 3 + 6);
  });

  it('ошибка никогда не отнимает накопленное', () => {
    const before = play(simple, [forward(), answerRight(), forward()]);
    const after = play(simple, [forward(), answerRight(), forward(), answerWrong()]);
    expect(after.drops).toBe(before.drops);
  });
});

describe('ошибки и повторные попытки', () => {
  it('оставляет на том же задании и обнуляет комбо', () => {
    const state = play(simple, [forward(), answerRight(), forward(), answerWrong(), forward()]);
    expect(state.status).toBe('playing');
    expect(currentSlot(simple, state)?.id).toBe('b');
    expect(state.combo).toBe(0);
    expect(state.bestCombo).toBe(1);
  });

  it('после трёх промахов отпускает дальше', () => {
    const state = play(simple, [
      forward(),
      answerWrong(),
      forward(),
      answerWrong(),
      forward(),
      answerWrong(),
    ]);
    expect(state.feedback?.moveOn).toBe(true);
    expect(play(simple, [
      forward(),
      answerWrong(),
      forward(),
      answerWrong(),
      forward(),
      answerWrong(),
      forward(),
    ]).slotIndex).toBe(1);
  });

  it('не даёт бонус за чистый шаг, если была ошибка', () => {
    const state = play(simple, [forward(), answerWrong(), forward(), ...solveSlot(2)]);
    expect(state.drops).toBe(1 + 3 + lessonBonus);
  });
});

describe('подсказки', () => {
  it('не выдаются дважды на одно задание', () => {
    const state = play(simple, [forward(), askHint(), askHint()]);
    expect(state.hintsLeft).toBe(hintsPerLesson - 1);
  });

  it('не выдаются там, где шаг их запрещает', () => {
    const state = play(inequalitiesLesson, [forward(), askHint()]);
    expect(state.hintsLeft).toBe(hintsPerLesson);
    expect(state.hintUsed).toBe(false);
  });

  it('держатся на повторной попытке того же задания', () => {
    const state = play(simple, [forward(), askHint(), answerWrong(), forward()]);
    expect(state.hintUsed).toBe(true);
  });
});

describe('адаптивная сложность', () => {
  it('растёт после двух верных подряд', () => {
    const state = play(adaptive, [forward(), ...solveSlot(2)]);
    expect(state.difficulty).toBe(2);
  });

  it('падает после ошибки', () => {
    const state = play(adaptive, [forward(), ...solveSlot(2), answerWrong()]);
    expect(state.difficulty).toBe(1);
  });

  it('не двигается на шаге без адаптации', () => {
    const state = play(simple, [forward(), ...solveSlot(2)]);
    expect(state.difficulty).toBe(1);
  });
});

describe('ачивки', () => {
  it('ливень за пять верных подряд', () => {
    const four = play(adaptive, [forward(), ...solveSlot(4)]);
    expect(four.achievements).toEqual([]);

    const five = play(adaptive, [forward(), ...solveSlot(5)]);
    expect(five.achievements.map((item) => item.id)).toContain(achievements.downpour.id);
  });

  it('выдаются по одному разу', () => {
    const state = play(adaptive, [forward(), ...solveSlot(6)]);
    const ids = state.achievements.map((item) => item.id);
    expect(ids.length).toBe(new Set(ids).size);
  });
});

describe('журнал ответов', () => {
  it('пишет строку на каждую попытку', () => {
    const state = play(simple, [forward(), answerWrong(2000), forward(), answerRight(5000)]);
    expect(state.answers).toHaveLength(2);
    expect(state.answers.at(0)).toMatchObject({ taskId: 'a', attempt: 1, correct: false });
    expect(state.answers.at(1)).toMatchObject({ taskId: 'a', attempt: 2, correct: true });
    expect(mistakesInStep(state, 'first')).toBe(1);
  });

  it('считает время от показа задания', () => {
    const state = play(simple, [forward(0), answerRight(2500)]);
    expect(state.answers.at(0)?.timeMs).toBe(2500);
  });

  it('считает точность по первым попыткам', () => {
    const state = play(simple, [forward(), answerWrong(), forward(), answerRight(), forward(), answerRight()]);
    expect(accuracy(state)).toBeCloseTo(0.5);
  });
});

describe('сценарий занятия', () => {
  it('состоит из восьми шагов и кончается финалом', () => {
    expect(inequalitiesLesson.steps).toHaveLength(8);
    expect(inequalitiesLesson.steps.at(-1)?.kind).toBe('summary');
  });

  it('проходится целиком без застреваний', () => {
    const reducer = createLessonReducer(inequalitiesLesson);
    let state = initialLessonState(inequalitiesLesson, 0);
    let clock = 0;

    for (let guard = 0; guard < 200 && state.status !== 'summary'; guard += 1) {
      clock += 100;
      state =
        state.status === 'playing'
          ? reducer(state, answerRight(clock))
          : reducer(state, forward(clock));
    }

    expect(state.status).toBe('summary');
    expect(state.answers.length).toBeGreaterThan(15);
    expect(starsFor(inequalitiesLesson, state)).toBe(3);
  });

  it('выдаёт ачивку шага 4 на карточке-правиле', () => {
    const reducer = createLessonReducer(inequalitiesLesson);
    let state = initialLessonState(inequalitiesLesson, 0);
    let clock = 0;

    while (state.status !== 'reward') {
      clock += 100;
      state =
        state.status === 'playing'
          ? reducer(state, answerRight(clock))
          : reducer(state, forward(clock));
    }

    expect(currentStep(inequalitiesLesson, state)?.id).toBe('surprise');
    expect(state.achievements.map((item) => item.id)).toContain(achievements.allOfThem.id);
  });

  it('две звезды, если испытание прошло с ошибкой', () => {
    const reducer = createLessonReducer(inequalitiesLesson);
    let state = initialLessonState(inequalitiesLesson, 0);
    let clock = 0;
    let stumbled = false;

    while (state.status !== 'summary') {
      clock += 100;
      if (state.status === 'playing') {
        const challenge = currentStep(inequalitiesLesson, state)?.id === 'challenge';
        const miss: boolean = challenge && !stumbled;
        stumbled = stumbled || miss;
        state = reducer(state, miss ? answerWrong(clock) : answerRight(clock));
      } else {
        state = reducer(state, forward(clock));
      }
    }

    expect(starsFor(inequalitiesLesson, state)).toBe(2);
  });
});

describe('перезапуск', () => {
  it('возвращает всё в ноль', () => {
    const played = play(simple, [forward(), ...solveSlot(2)]);
    const reset = createLessonReducer(simple)(played, { type: 'restart', at: 9000 });
    expect(reset).toEqual(initialLessonState(simple, 9000));
  });
});