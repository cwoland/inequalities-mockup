import { describe, expect, it } from 'vitest';
import { intBetween, mulberry32, pick, shuffle } from '../random';

function take(seed: number, count: number): number[] {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, () => rng());
}

describe('mulberry32', () => {
  it('даёт одинаковую последовательность для одного сида', () => {
    expect(take(42, 10)).toEqual(take(42, 10));
  });

  it('даёт разные последовательности для разных сидов', () => {
    expect(take(42, 10)).not.toEqual(take(43, 10));
  });

  it('держится в полуинтервале от нуля до единицы', () => {
    for (const value of take(7, 500)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('intBetween', () => {
  it('не выходит за границы', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 500; i += 1) {
      const value = intBetween(rng, 3, 7);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('достаёт обе границы диапазона', () => {
    const rng = mulberry32(2);
    const seen = new Set(Array.from({ length: 500 }, () => intBetween(rng, 0, 3)));
    expect([...seen].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  it('падает на пустом диапазоне', () => {
    expect(() => intBetween(mulberry32(1), 5, 4)).toThrow();
  });
});

describe('pick', () => {
  it('возвращает элемент списка и повторяется для одного сида', () => {
    const items = ['а', 'б', 'в'];
    const first = pick(mulberry32(9), items);
    expect(items).toContain(first);
    expect(pick(mulberry32(9), items)).toBe(first);
  });

  it('падает на пустом списке', () => {
    expect(() => pick(mulberry32(1), [])).toThrow();
  });
});

describe('shuffle', () => {
  it('сохраняет состав', () => {
    const items = [1, 2, 3, 4, 5];
    expect([...shuffle(mulberry32(5), items)].sort((a, b) => a - b)).toEqual(items);
  });

  it('воспроизводится по сиду', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(shuffle(mulberry32(5), items)).toEqual(shuffle(mulberry32(5), items));
  });

  it('не возвращает исходный порядок всегда', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const orders = Array.from({ length: 20 }, (_, seed) => shuffle(mulberry32(seed), items));
    expect(orders.some((order) => !order.every((value, index) => value === items.at(index)))).toBe(
      true,
    );
  });
});