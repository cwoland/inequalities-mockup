import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveLessonProgress } from '../lessonProgress';

afterEach(() => vi.unstubAllGlobals());

function storage() {
  const items = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => items.set(key, value),
  });
  return () =>
    JSON.parse(items.get('rostok:inequalities:progress') ?? '{}') as {
      bestStars: number;
      streakDays: number;
      gardenItem: string;
    };
}

describe('сохранение результата', () => {
  it('сохраняет награду и увеличивает моковую серию', () => {
    const read = storage();
    saveLessonProgress(2, 4, new Date(2026, 9, 31));
    expect(read()).toMatchObject({
      bestStars: 2,
      streakDays: 5,
      gardenItem: 'Лейка исследователя',
    });
  });

  it('повтор в тот же день не увеличивает серию и не снижает звёзды', () => {
    const read = storage();
    saveLessonProgress(3, 4, new Date(2026, 9, 31));
    saveLessonProgress(1, 4, new Date(2026, 9, 31));
    expect(read()).toMatchObject({ bestStars: 3, streakDays: 5 });
  });

  it('продолжает серию через границу месяца и начинает новую после пропуска', () => {
    const read = storage();
    saveLessonProgress(1, 4, new Date(2026, 9, 31));
    saveLessonProgress(2, 4, new Date(2026, 10, 1));
    expect(read().streakDays).toBe(6);
    saveLessonProgress(2, 4, new Date(2026, 10, 3));
    expect(read().streakDays).toBe(1);
  });

  it('не прерывает урок при повреждённом хранилище или запрете записи', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => '{',
      setItem: () => {
        throw new Error('Недоступно');
      },
    });
    expect(() => saveLessonProgress(3, 4)).not.toThrow();
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('Недоступно');
      },
    });
    expect(() => saveLessonProgress(3, 4)).not.toThrow();
  });
});
