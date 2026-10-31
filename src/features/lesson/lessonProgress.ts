export type LessonProgress = {
  bestStars: number;
  gardenItem: string;
  streakDays: number;
  completedOn: string;
};

export const progressStorageKey = 'rostok:inequalities:progress';
export const progressUpdatedEvent = 'rostok:progress-updated';

function dayKey(date: Date): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
}

function previousDayKey(date: Date): string {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return dayKey(previous);
}

function isDayKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (year === undefined || month === undefined || day === undefined) {
    return false;
  }

  return dayKey(new Date(year, month - 1, day)) === value;
}

export function parseLessonProgress(raw: string | null): LessonProgress | null {
  if (raw === null) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(raw);

    if (typeof value !== 'object' || value === null) {
      return null;
    }

    if (
      !('bestStars' in value) ||
      typeof value.bestStars !== 'number' ||
      !Number.isInteger(value.bestStars) ||
      value.bestStars < 1 ||
      value.bestStars > 3 ||
      !('streakDays' in value) ||
      typeof value.streakDays !== 'number' ||
      !Number.isSafeInteger(value.streakDays) ||
      value.streakDays < 1 ||
      !('completedOn' in value) ||
      !isDayKey(value.completedOn) ||
      !('gardenItem' in value) ||
      typeof value.gardenItem !== 'string'
    ) {
      return null;
    }

    return {
      bestStars: value.bestStars,
      gardenItem: value.gardenItem,
      streakDays: value.streakDays,
      completedOn: value.completedOn,
    };
  } catch {
    return null;
  }
}

export function readProgressSnapshot(): string | null {
  try {
    return localStorage.getItem(progressStorageKey);
  } catch {
    return null;
  }
}

export function visibleStreak(
  progress: LessonProgress | null,
  initialStreak: number,
  date?: Date,
): number {
  if (progress === null) {
    return initialStreak;
  }

  const currentDate = date ?? new Date();

  const isCurrent =
    progress.completedOn === dayKey(currentDate) ||
    progress.completedOn === previousDayKey(currentDate);

  return isCurrent ? progress.streakDays : 0;
}

export function saveLessonProgress(
  stars: number,
  initialStreak: number,
  date = new Date(),
): void {
  if (!Number.isInteger(stars) || stars < 1 || stars > 3) {
    return;
  }

  const previous = parseLessonProgress(readProgressSnapshot());
  const today = dayKey(date);

  const baseStreak = Math.max(
    0,
    Number.isSafeInteger(initialStreak) ? initialStreak : 0,
  );

  const streakDays =
    previous === null
      ? baseStreak + 1
      : previous.completedOn === today
        ? previous.streakDays
        : previous.completedOn === previousDayKey(date)
          ? previous.streakDays + 1
          : 1;

  const progress: LessonProgress = {
    bestStars: Math.max(previous?.bestStars ?? 0, stars),
    gardenItem: 'Лейка исследователя',
    streakDays,
    completedOn: today,
  };

  try {
    localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    return;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(progressUpdatedEvent));
  }
}
