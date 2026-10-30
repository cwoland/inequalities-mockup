import { describe, expect, it } from 'vitest';
import type { BoxInequality } from '../inequality';
import {
  contains,
  formatSolution,
  isContiguous,
  sameSolution,
  solutionSet,
  solve,
  toRange,
  universeSize,
} from '../numberLine';

const line = { min: 0, max: 10 };

function box(patch: Partial<BoxInequality> = {}): BoxInequality {
  return { boxSide: 'left', shift: 0, relation: 'lt', value: 5, universe: line, ...patch };
}

describe('solve', () => {
  it('решает строгие неравенства с окошком', () => {
    expect(solve(box({ value: 5 })).values).toEqual([0, 1, 2, 3, 4]);
    expect(solve(box({ relation: 'gt', value: 7 })).values).toEqual([8, 9, 10]);
  });

  it('решает неравенства со сдвигом', () => {
    expect(solve(box({ shift: 3, relation: 'gt', value: 10 })).values).toEqual([8, 9, 10]);
    expect(solve(box({ shift: -2, value: 6, universe: { min: 2, max: 10 } })).values).toEqual([
      2, 3, 4, 5, 6, 7,
    ]);
  });

  it('решает неравенство с окошком справа', () => {
    expect(solve(box({ boxSide: 'right', relation: 'gt', value: 7 })).values).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
  });

  it('у равенства ровно одно решение', () => {
    expect(solve(box({ shift: 3, relation: 'eq', value: 10 })).values).toEqual([7]);
  });

  it('возвращает пустое множество, когда решений нет', () => {
    expect(solve(box({ value: 0 })).values).toEqual([]);
  });

  it('всегда даёт непрерывный отрезок', () => {
    const cases: BoxInequality[] = [
      box({ value: 5 }),
      box({ relation: 'gt', value: 7 }),
      box({ shift: 3, relation: 'gt', value: 10 }),
      box({ boxSide: 'right', relation: 'gt', value: 7 }),
      box({ relation: 'eq', value: 4 }),
      box({ value: 0 }),
    ];
    for (const item of cases) {
      expect(isContiguous(solve(item))).toBe(true);
    }
  });
});

describe('solutionSet', () => {
  it('отбрасывает числа вне прямой, убирает повторы и сортирует', () => {
    expect(solutionSet(line, [5, 2, 2, 11, -1, 0]).values).toEqual([0, 2, 5]);
  });
});

describe('toRange', () => {
  it('даёт концы отрезка', () => {
    expect(toRange(solutionSet(line, [3, 4, 5]))).toEqual({ from: 3, to: 5 });
  });

  it('возвращает null на пустом множестве', () => {
    expect(toRange(solutionSet(line, []))).toBeNull();
  });
});

describe('sameSolution', () => {
  it('сравнивает состав', () => {
    expect(sameSolution(solutionSet(line, [1, 2]), solutionSet(line, [2, 1]))).toBe(true);
    expect(sameSolution(solutionSet(line, [1, 2]), solutionSet(line, [1, 2, 3]))).toBe(false);
  });

  it('различает одинаковый состав на разных прямых', () => {
    const narrow = solutionSet(line, [1, 2]);
    const wide = solutionSet({ min: 0, max: 20 }, [1, 2]);
    expect(sameSolution(narrow, wide)).toBe(false);
  });
});

describe('мелкие помощники', () => {
  it('considers принадлежность и размер прямой', () => {
    expect(contains(solutionSet(line, [1, 2]), 2)).toBe(true);
    expect(contains(solutionSet(line, [1, 2]), 3)).toBe(false);
    expect(universeSize(line)).toBe(11);
  });

  it('читаемо описывает ответ', () => {
    expect(formatSolution(solutionSet(line, [0, 1, 2]))).toBe('0, 1, 2');
    expect(formatSolution(solutionSet(line, []))).toBe('ни одного числа');
  });
});