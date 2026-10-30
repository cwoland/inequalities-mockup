import type { Metadata } from 'next';
import { LessonProvider } from '@/features/lesson/LessonProvider';
import { LessonShell } from '@/features/lesson/components/LessonShell/LessonShell';
import { StepRenderer } from '@/features/lesson/components/StepRenderer/StepRenderer';
import { inequalitiesLesson } from '@/features/lesson/lessonScript';

export const metadata: Metadata = {
  title: 'Больше, меньше или равно — Росток',
};

export default function InequalitiesLessonPage() {
  return (
    <LessonProvider script={inequalitiesLesson}>
      <LessonShell>
        <StepRenderer />
      </LessonShell>
    </LessonProvider>
  );
}
