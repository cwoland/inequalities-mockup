import { describe, expect, it } from 'vitest';
import {
  compareNumbers,
  evaluate,
  flipRelation,
  formatBox,
  formatBoxInequality,
  formatExpr,
  holdsFor,
  universeValues,
  type BoxInequality,
} from '../inequality';

const line = { min: 0, max: 10 };

function box(patch: Partial<BoxInequality> = {}): BoxInequality {
  return { boxSide: 'left', shift: 0, relation: 'lt', value: 5, universe: line, ...patch };
}

describe('evaluate', () => {
  it('считает число, сумму и разность', () => {
    expect(evaluate({ kind: 'num', value: 7 })).toBe(7);
    expect(evaluate({ kind: 'add', left: 7, right: 5 })).toBe(12);
    expect(evaluate({ kind: 'sub', left: 12, right: 4 })).toBe(8);
  });
});

describe('compareNumbers', () => {
  it('различает три отношения', () => {
    expect(compareNumbers(3, 8)).toBe('lt');
    expect(compareNumbers(8, 3)).toBe('gt');
    expect(compareNumbers(8, 8)).toBe('eq');
  });
});

describe('holdsFor', () => {
  it('проверяет окошко слева', () => {
    expect(holdsFor(box({ value: 5 }), 4)).toBe(true);
    expect(holdsFor(box({ value: 5 }), 5)).toBe(false);
    expect(holdsFor(box({ value: 5 }), 6)).toBe(false);
  });

  it('учитывает сдвиг', () => {
    expect(holdsFor(box({ shift: 3, relation: 'gt', value: 10 }), 8)).toBe(true);
    expect(holdsFor(box({ shift: 3, relation: 'gt', value: 10 }), 7)).toBe(false);
  });

  it('проверяет окошко справа', () => {
    expect(holdsFor(box({ boxSide: 'right', relation: 'gt', value: 7 }), 6)).toBe(true);
    expect(holdsFor(box({ boxSide: 'right', relation: 'gt', value: 7 }), 7)).toBe(false);
  });

  it('работает с равенством', () => {
    expect(holdsFor(box({ shift: 3, relation: 'eq', value: 10 }), 7)).toBe(true);
    expect(holdsFor(box({ shift: 3, relation: 'eq', value: 10 }), 6)).toBe(false);
  });
});

describe('universeValues', () => {
  it('включает оба конца', () => {
    expect(universeValues({ min: 3, max: 6 })).toEqual([3, 4, 5, 6]);
  });
});

describe('flipRelation', () => {
  it('меняет направление и сводит равенство к строгому', () => {
    expect(flipRelation('lt')).toBe('gt');
    expect(flipRelation('gt')).toBe('lt');
    expect(flipRelation('eq')).toBe('lt');
  });
});

describe('форматирование', () => {
  it('пишет выражения с типографским минусом', () => {
    expect(formatExpr({ kind: 'num', value: 9 })).toBe('9');
    expect(formatExpr({ kind: 'add', left: 7, right: 5 })).toBe('7 + 5');
    expect(formatExpr({ kind: 'sub', left: 12, right: 4 })).toBe('12 − 4');
  });

  it('пишет окошко со сдвигом', () => {
    expect(formatBox(0)).toBe('□');
    expect(formatBox(3)).toBe('□ + 3');
    expect(formatBox(-2)).toBe('□ − 2');
  });

  it('пишет неравенство с любой стороны', () => {
    expect(formatBoxInequality(box({ value: 5 }))).toBe('□ < 5');
    expect(formatBoxInequality(box({ shift: 3, relation: 'gt', value: 10 }))).toBe('□ + 3 > 10');
    expect(formatBoxInequality(box({ boxSide: 'right', relation: 'gt', value: 7 }))).toBe('7 > □');
    expect(formatBoxInequality(box({ relation: 'eq', value: 8 }))).toBe('□ = 8');
  });
});