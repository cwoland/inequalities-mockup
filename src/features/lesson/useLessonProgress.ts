'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  parseLessonProgress,
  progressStorageKey,
  progressUpdatedEvent,
  readProgressSnapshot,
} from './lessonProgress';

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === progressStorageKey || event.key === null) {
      onChange();
    }
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(progressUpdatedEvent, onChange);
  window.addEventListener('focus', onChange);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(progressUpdatedEvent, onChange);
    window.removeEventListener('focus', onChange);
  };
}

function serverSnapshot(): null {
  return null;
}

export function useLessonProgress() {
  const raw = useSyncExternalStore(
    subscribe,
    readProgressSnapshot,
    serverSnapshot,
  );

  return useMemo(() => parseLessonProgress(raw), [raw]);
}