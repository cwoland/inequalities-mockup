export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function intBetween(rng: Rng, min: number, max: number): number {
  if (max < min) {
    throw new Error(`intBetween: пустой диапазон ${min}…${max}`);
  }
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  const index = intBetween(rng, 0, items.length - 1);
  const chosen = items[index];
  if (chosen === undefined) {
    throw new Error(`pick: нечего выбрать, длина ${items.length}`);
  }
  return chosen;
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  return items
    .map((item) => ({ item, key: rng() }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.item);
}