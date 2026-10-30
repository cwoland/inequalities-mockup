import {
  flipRelation,
  universeValues,
  type BoxInequality,
  type BoxSide,
  type Expr,
  type Relation,
  type Universe,
} from './inequality';
import {
  sameSolution,
  solutionSet,
  solve,
  toRange,
  type SolutionRange,
  type SolutionSet,
} from './numberLine';
import { intBetween, mulberry32, pick, shuffle, type Rng } from './random';

export type Difficulty = 1 | 2 | 3;

export type GeneratorInput = { seed: number; difficulty: Difficulty };

export type ComparePair = { left: Expr; right: Expr };

export type LineOptions = {
  inequality: BoxInequality;
  options: SolutionSet[];
  correctIndex: number;
};

const attemptLimit = 40;

export function universeFor(difficulty: Difficulty, shift = 0): Universe {
  return { min: Math.max(0, -shift), max: difficulty === 3 ? 20 : 10 };
}

function numberExpr(value: number): Expr {
  return { kind: 'num', value };
}

function digitTrapPair(rng: Rng): ComparePair {
  const single = intBetween(rng, 6, 9);
  const double = intBetween(rng, 10, 15);
  return pick(rng, [
    { left: numberExpr(single), right: numberExpr(double) },
    { left: numberExpr(double), right: numberExpr(single) },
  ]);
}

function sumPair(rng: Rng): ComparePair {
  const shared = intBetween(rng, 2, 8);
  const first = intBetween(rng, 2, 9);
  const delta = pick(rng, [-2, -1, 0, 1, 2]);
  const second = Math.max(0, first + delta);
  return {
    left: { kind: 'add', left: first, right: shared },
    right: { kind: 'add', left: second, right: shared },
  };
}

function diffPair(rng: Rng): ComparePair {
  const start = intBetween(rng, 10, 20);
  const take = intBetween(rng, 1, 9);
  const delta = pick(rng, [-2, -1, 0, 1, 2]);
  return {
    left: { kind: 'sub', left: start, right: take },
    right: numberExpr(Math.max(0, start - take + delta)),
  };
}

export function generateComparePair({ seed, difficulty }: GeneratorInput): ComparePair {
  const rng = mulberry32(seed);
  if (difficulty === 1) {
    const first = intBetween(rng, 0, 10);
    const equal = rng() < 0.2;
    const second = equal ? first : intBetween(rng, 0, 10);
    return { left: numberExpr(first), right: numberExpr(second) };
  }
  const makers = difficulty === 2 ? [digitTrapPair, sumPair] : [sumPair, diffPair];
  return pick(rng, makers)(rng);
}

function isUsable(inequality: BoxInequality): boolean {
  const found = solve(inequality).values;
  if (inequality.relation === 'eq') {
    const only = found.at(0);
    return (
      found.length === 1 &&
      only !== undefined &&
      only > inequality.universe.min &&
      only < inequality.universe.max
    );
  }
  const mirror = solve({ ...inequality, relation: flipRelation(inequality.relation) }).values;
  return found.length >= 3 && mirror.length >= 3;
}

function draftBoxInequality(rng: Rng, difficulty: Difficulty): BoxInequality {
  const relation =
    difficulty === 3
      ? pick<Relation>(rng, ['lt', 'gt', 'eq'])
      : pick<Relation>(rng, ['lt', 'gt']);
  const shift =
    difficulty === 1 ? 0 : difficulty === 2 ? intBetween(rng, -3, 3) : intBetween(rng, -5, 5);
  const boxSide: BoxSide = difficulty === 1 ? 'left' : pick<BoxSide>(rng, ['left', 'right']);
  const universe = universeFor(difficulty, shift);
  const boundary = intBetween(rng, universe.min + 1, universe.max);
  return { boxSide, shift, relation, value: boundary + shift, universe };
}

function fallbackBoxInequality(difficulty: Difficulty): BoxInequality {
  const universe = universeFor(difficulty);
  return { boxSide: 'left', shift: 0, relation: 'lt', value: universe.min + 3, universe };
}

export function generateBoxInequality({ seed, difficulty }: GeneratorInput): BoxInequality {
  const rng = mulberry32(seed);
  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    const draft = draftBoxInequality(rng, difficulty);
    if (isUsable(draft)) {
      return draft;
    }
  }
  return fallbackBoxInequality(difficulty);
}

function runRanges(universe: Universe): SolutionRange[] {
  const all = universeValues(universe);
  return all.flatMap((from) => all.filter((to) => to >= from).map((to) => ({ from, to })));
}

function rangeToSet(universe: Universe, range: SolutionRange): SolutionSet {
  return solutionSet(
    universe,
    universeValues(universe).filter((value) => value >= range.from && value <= range.to),
  );
}

function closenessRank(run: SolutionRange, target: SolutionRange, matchLength: boolean): number {
  const shift = Math.abs(run.from - target.from) + Math.abs(run.to - target.to);
  if (!matchLength) {
    return shift;
  }
  return shift + 4 * Math.abs(run.to - run.from - (target.to - target.from));
}

function byCloseness(target: SolutionRange) {
  const single = target.from === target.to;
  return (a: SolutionRange, b: SolutionRange): number =>
    closenessRank(a, target, single) - closenessRank(b, target, single) ||
    a.from - b.from ||
    a.to - b.to;
}

function nearbySets(universe: Universe, correct: SolutionSet): SolutionSet[] {
  const target = toRange(correct) ?? { from: universe.min, to: universe.min };
  return runRanges(universe)
    .sort(byCloseness(target))
    .map((range) => rangeToSet(universe, range));
}

function uniqueSets(sets: readonly SolutionSet[]): SolutionSet[] {
  return sets.reduce<SolutionSet[]>(
    (acc, set) => (acc.some((kept) => sameSolution(kept, set)) ? acc : [...acc, set]),
    [],
  );
}

function meaningfulDistractors(inequality: BoxInequality): SolutionSet[] {
  const forgottenShift = solve({ ...inequality, shift: 0 });
  if (inequality.relation === 'eq') {
    return [forgottenShift];
  }
  return [solve({ ...inequality, relation: flipRelation(inequality.relation) }), forgottenShift];
}

function buildDistractors(inequality: BoxInequality, correct: SolutionSet): SolutionSet[] {
  return uniqueSets([
    correct,
    ...meaningfulDistractors(inequality),
    ...nearbySets(inequality.universe, correct),
  ])
    .filter((set) => set.values.length > 0 && !sameSolution(set, correct))
    .slice(0, 3);
}

export function generateLineOptions(input: GeneratorInput): LineOptions {
  const inequality = generateBoxInequality(input);
  const correct = solve(inequality);
  const distractors = buildDistractors(inequality, correct);
  if (distractors.length < 3) {
    throw new Error(`generateLineOptions: мало отвлекающих вариантов, seed ${input.seed}`);
  }
  const rng = mulberry32(input.seed ^ 0x9e3779b9);
  const options = shuffle(rng, [correct, ...distractors]);
  return {
    inequality,
    options,
    correctIndex: options.findIndex((option) => sameSolution(option, correct)),
  };
}