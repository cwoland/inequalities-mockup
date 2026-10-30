import { holdsFor, universeValues, type BoxInequality, type Universe } from './inequality';

export type SolutionSet = {
  universe: Universe;
  values: number[];
};

export type SolutionRange = { from: number; to: number };

export function solutionSet(universe: Universe, values: readonly number[]): SolutionSet {
  const inside = values.filter((value) => value >= universe.min && value <= universe.max);
  return { universe, values: [...new Set(inside)].sort((a, b) => a - b) };
}

export function solve(inequality: BoxInequality): SolutionSet {
  const values = universeValues(inequality.universe).filter((candidate) =>
    holdsFor(inequality, candidate),
  );
  return { universe: inequality.universe, values };
}

export function universeSize(universe: Universe): number {
  return universe.max - universe.min + 1;
}

export function toRange(set: SolutionSet): SolutionRange | null {
  const first = set.values.at(0);
  const last = set.values.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  return { from: first, to: last };
}

export function isContiguous(set: SolutionSet): boolean {
  const range = toRange(set);
  if (range === null) {
    return true;
  }
  return set.values.length === range.to - range.from + 1;
}

export function contains(set: SolutionSet, candidate: number): boolean {
  return set.values.includes(candidate);
}

export function sameSolution(a: SolutionSet, b: SolutionSet): boolean {
  return (
    a.universe.min === b.universe.min &&
    a.universe.max === b.universe.max &&
    a.values.length === b.values.length &&
    a.values.every((value, index) => value === b.values.at(index))
  );
}

export function formatSolution(set: SolutionSet): string {
  if (set.values.length === 0) {
    return 'ни одного числа';
  }
  return set.values.join(', ');
}