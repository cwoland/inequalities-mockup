export type GrowthStage = 'seed' | 'sprout' | 'sapling' | 'tree';

export type Student = {
  name: string;
  grade: number;
  drops: number;
  stage: GrowthStage;
  streakDays: number;
};

export const stageLabels: Record<GrowthStage, string> = {
  seed: 'Семечко',
  sprout: 'Росток',
  sapling: 'Саженец',
  tree: 'Дерево',
};

export const student: Student = {
  name: 'Маша',
  grade: 3,
  drops: 128,
  stage: 'sprout',
  streakDays: 4,
};