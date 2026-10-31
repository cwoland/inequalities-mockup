export type LessonCard = {
  slug: string;
  title: string;
  subtitle: string;
  grades: string;
  minutes: number;
  stars: 0 | 1 | 2 | 3;
  available: boolean;
};

export const lessons: LessonCard[] = [
  {
    slug: 'inequalities',
    title: 'Больше, меньше или равно',
    subtitle: 'Знаки <, > и = и неравенства с окошком',
    grades: '3 класс',
    minutes: 12,
    stars: 0,
    available: true,
  },
  {
    slug: 'addition-100',
    title: 'Сложение в пределах 100',
    subtitle: 'Скоро откроем',
    grades: '2–3 класс',
    minutes: 10,
    stars: 0,
    available: false,
  },
];
