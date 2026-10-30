export type Relation = 'lt' | 'gt' | 'eq';

export type Expr =
  | { kind: 'num'; value: number }
  | { kind: 'add'; left: number; right: number }
  | { kind: 'sub'; left: number; right: number };

export type Universe = { min: number; max: number };

export type BoxSide = 'left' | 'right';

export type BoxInequality = {
  boxSide: BoxSide;
  shift: number;
  relation: Relation;
  value: number;
  universe: Universe;
};

export const relationSigns: Record<Relation, string> = {
  lt: '<',
  gt: '>',
  eq: '=',
};

export function evaluate(expr: Expr): number {
  switch (expr.kind) {
    case 'num':
      return expr.value;
    case 'add':
      return expr.left + expr.right;
    case 'sub':
      return expr.left - expr.right;
  }
}

export function compareNumbers(left: number, right: number): Relation {
  if (left < right) {
    return 'lt';
  }
  if (left > right) {
    return 'gt';
  }
  return 'eq';
}

export function holds(relation: Relation, left: number, right: number): boolean {
  return compareNumbers(left, right) === relation;
}

export function universeValues(universe: Universe): number[] {
  const values: number[] = [];
  for (let value = universe.min; value <= universe.max; value += 1) {
    values.push(value);
  }
  return values;
}

export function substitute(
  inequality: BoxInequality,
  candidate: number,
): { left: number; right: number } {
  const box = candidate + inequality.shift;
  return inequality.boxSide === 'left'
    ? { left: box, right: inequality.value }
    : { left: inequality.value, right: box };
}

export function holdsFor(inequality: BoxInequality, candidate: number): boolean {
  const { left, right } = substitute(inequality, candidate);
  return holds(inequality.relation, left, right);
}

export function flipRelation(relation: Relation): Relation {
  if (relation === 'lt') {
    return 'gt';
  }
  if (relation === 'gt') {
    return 'lt';
  }
  return 'lt';
}

export function formatExpr(expr: Expr): string {
  switch (expr.kind) {
    case 'num':
      return String(expr.value);
    case 'add':
      return `${expr.left} + ${expr.right}`;
    case 'sub':
      return `${expr.left} − ${expr.right}`;
  }
}

export function formatBox(shift: number): string {
  if (shift === 0) {
    return '□';
  }
  return shift > 0 ? `□ + ${shift}` : `□ − ${Math.abs(shift)}`;
}

export function formatBoxInequality(inequality: BoxInequality): string {
  const box = formatBox(inequality.shift);
  const sign = relationSigns[inequality.relation];
  return inequality.boxSide === 'left'
    ? `${box} ${sign} ${inequality.value}`
    : `${inequality.value} ${sign} ${box}`;
}