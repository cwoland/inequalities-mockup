import type { Achievement } from './types';

export const achievements = {
    allOfThem: {
        id: 'all-of-them',
        title: 'Все до одного',
        description: 'Нашел все подходящие числа',
    },
    sharpEye: {
        id: 'sharp-eye',
        title: 'Зоркий глаз',
        description: 'Поймал ошибку Путанника с первого раза',
    },
    downpour: {
        id: 'downpour',
        title: 'Ливень',
        description: 'Пять верных ответов подряд',
    },
} satisfies Record<string, Achievement>;