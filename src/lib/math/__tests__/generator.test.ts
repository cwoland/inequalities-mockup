import { describe, expect, it } from 'vitest';
import { evaluate, flipRelation, formatBoxInequality } from '../inequality';
import { isContiguous, sameSolution, solve } from '../numberLine';
import {
  generateBoxInequality,
  generateComparePair,
  generateLineOptions,
  universeFor,
  type Difficulty,
} from '../generator';

const difficulties: Difficulty[] = [1, 2, 3];
const seeds = Array.from({ length: 300 }, (_, index) => index + 1);

describe('universeFor', () => {
  it('расширяется до двадцати только на третьей сложности', () => {
    expect(universeFor(1)).toEqual({ min: 0, max: 10 });
    expect(universeFor(2)).toEqual({ min: 0, max: 10 });
    expect(universeFor(3)).toEqual({ min: 0, max: 20 });
  });

  it('сдвигает начало прямой при вычитании', () => {
    expect(universeFor(2, -3)).toEqual({ min: 3, max: 10 });
    expect(universeFor(2, 3)).toEqual({ min: 0, max: 10 });
  });
});

describe('generateBoxInequality', () => {
  it('детерминирован по сиду', () => {
    for (const difficulty of difficulties) {
      expect(generateBoxInequality({ seed: 42, difficulty })).toEqual(
        generateBoxInequality({ seed: 42, difficulty }),
      );
    }
  });

  it('даёт разнообразие по разным сидам', () => {
    const texts = new Set(
      seeds.slice(0, 60).map((seed) => formatBoxInequality(generateBoxInequality({ seed, difficulty: 2 }))),
    );
    expect(texts.size).toBeGreaterThan(20);
  });

  it('первая сложность — только окошко слева, без сдвига и без равенства', () => {
    for (const seed of seeds) {
      const item = generateBoxInequality({ seed, difficulty: 1 });
      expect(item.shift).toBe(0);
      expect(item.boxSide).toBe('left');
      expect(item.relation).not.toBe('eq');
      expect(item.universe).toEqual({ min: 0, max: 10 });
    }
  });

  it('никогда не выдаёт выродившееся задание', () => {
    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const item = generateBoxInequality({ seed, difficulty });
        const found = solve(item).values;
        if (item.relation === 'eq') {
          expect(found).toHaveLength(1);
          expect(found.at(0)).toBeGreaterThan(item.universe.min);
          expect(found.at(0)).toBeLessThan(item.universe.max);
        } else {
          const mirror = solve({ ...item, relation: flipRelation(item.relation) }).values;
          expect(found.length).toBeGreaterThanOrEqual(3);
          expect(mirror.length).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it('держит числа на прямой неотрицательными', () => {
    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const item = generateBoxInequality({ seed, difficulty });
        expect(item.universe.min + item.shift).toBeGreaterThanOrEqual(0);
        expect(item.value).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('generateLineOptions', () => {
  it('детерминирован по сиду', () => {
    expect(generateLineOptions({ seed: 7, difficulty: 2 })).toEqual(
      generateLineOptions({ seed: 7, difficulty: 2 }),
    );
  });

  it('всегда четыре разных непустых варианта с одним верным', () => {
    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const { inequality, options, correctIndex } = generateLineOptions({ seed, difficulty });
        expect(options).toHaveLength(4);
        expect(correctIndex).toBeGreaterThanOrEqual(0);

        const correct = solve(inequality);
        const matching = options.filter((option) => sameSolution(option, correct));
        expect(matching).toHaveLength(1);
        expect(sameSolution(options[correctIndex] ?? correct, correct)).toBe(true);

        for (const option of options) {
          expect(option.values.length).toBeGreaterThan(0);
          expect(isContiguous(option)).toBe(true);
        }
      }
    }
  });

  it('у строгих знаков среди вариантов всегда есть зеркало знака', () => {
    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const { inequality, options } = generateLineOptions({ seed, difficulty });
        if (inequality.relation === 'eq') {
          continue;
        }
        const mirror = solve({ ...inequality, relation: flipRelation(inequality.relation) });
        expect(options.some((option) => sameSolution(option, mirror))).toBe(true);
      }
    }
  });

  it('у равенства все варианты — одиночные точки', () => {
    const equalities = seeds
      .map((seed) => generateLineOptions({ seed, difficulty: 3 }))
      .filter((item) => item.inequality.relation === 'eq');

    expect(equalities.length).toBeGreaterThan(0);
    for (const { options } of equalities) {
      for (const option of options) {
        expect(option.values).toHaveLength(1);
      }
    }
  });

  it('ставит верный вариант не всегда на одно место', () => {
    const places = new Set(
      seeds.slice(0, 40).map((seed) => generateLineOptions({ seed, difficulty: 2 }).correctIndex),
    );
    expect(places.size).toBeGreaterThan(1);
  });
});

describe('generateComparePair', () => {
  it('детерминирован по сиду', () => {
    for (const difficulty of difficulties) {
      expect(generateComparePair({ seed: 11, difficulty })).toEqual(
        generateComparePair({ seed: 11, difficulty }),
      );
    }
  });

  it('первая сложность — два числа до десяти', () => {
    for (const seed of seeds) {
      const { left, right } = generateComparePair({ seed, difficulty: 1 });
      expect(left.kind).toBe('num');
      expect(right.kind).toBe('num');
      expect(evaluate(left)).toBeLessThanOrEqual(10);
      expect(evaluate(right)).toBeLessThanOrEqual(10);
    }
  });

  it('первая сложность иногда даёт равные числа', () => {
    const equal = seeds.filter((seed) => {
      const pair = generateComparePair({ seed, difficulty: 1 });
      return evaluate(pair.left) === evaluate(pair.right);
    });
    expect(equal.length).toBeGreaterThan(0);
  });

  it('третья сложность сравнивает выражения, а не только числа', () => {
    const kinds = new Set(
      seeds.slice(0, 60).flatMap((seed) => {
        const pair = generateComparePair({ seed, difficulty: 3 });
        return [pair.left.kind, pair.right.kind];
      }),
    );
    expect(kinds.has('add')).toBe(true);
    expect(kinds.has('sub')).toBe(true);
  });

  it('никогда не уводит выражения в отрицательные числа', () => {
    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const pair = generateComparePair({ seed, difficulty });
        expect(evaluate(pair.left)).toBeGreaterThanOrEqual(0);
        expect(evaluate(pair.right)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});