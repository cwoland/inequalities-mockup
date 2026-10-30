'use client';

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { createLessonReducer, initialLessonState } from './lessonReducer';
import type { LessonAction, LessonScript, LessonState } from './types';

type LessonContextValue = {
  script: LessonScript;
  state: LessonState;
  dispatch: (action: LessonAction) => void;
};

const LessonContext = createContext<LessonContextValue | null>(null);

export function LessonProvider({
  script,
  children,
}: {
  script: LessonScript;
  children: ReactNode;
}) {
  const reducer = useMemo(() => createLessonReducer(script), [script]);
  const [state, dispatch] = useReducer(reducer, script, (value) => initialLessonState(value));
  const value = useMemo(() => ({ script, state, dispatch }), [script, state, dispatch]);

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}

export function useLesson(): LessonContextValue {
  const value = useContext(LessonContext);
  if (value === null) {
    throw new Error('useLesson вызван вне LessonProvider');
  }
  return value;
}
