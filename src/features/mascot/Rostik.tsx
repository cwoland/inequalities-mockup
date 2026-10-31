'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { GrowthStage } from '@/mocks/student';

export type RostikState = 'idle' | 'happy' | 'thinking' | 'oops' | 'dance' | 'grow';

export function Rostik({
  state = 'idle',
  stage = 'sprout',
  size = 112,
}: {
  state?: RostikState;
  stage?: GrowthStage;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const celebrating = state === 'happy' || state === 'dance' || state === 'grow';
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      role="img"
      aria-label="Ростик — твой помощник"
      animate={
        reduced
          ? {}
          : {
              rotate: state === 'dance' ? [0, -9, 9, 0] : state === 'thinking' ? -8 : [0, 2, 0],
              y: celebrating ? [0, -10, 0] : 0,
            }
      }
      transition={{ duration: celebrating ? 0.7 : 2.5, repeat: Infinity }}
    >
      <ellipse cx="70" cy="126" rx="35" ry="6" fill="var(--color-line)" />
      <path
        d="M70 120 Q60 82 73 47"
        fill="none"
        stroke="var(--color-growth-dark)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d={
          state === 'oops'
            ? 'M66 93 Q22 70 28 116 Q55 120 66 93'
            : 'M66 93 Q16 94 24 56 Q58 56 66 93'
        }
        fill="var(--color-growth)"
      />
      <path
        d={
          celebrating ? 'M73 85 Q83 38 119 44 Q121 83 73 85' : 'M73 92 Q88 58 119 70 Q113 104 73 92'
        }
        fill="var(--color-growth-dark)"
      />
      <path
        d="M72 53 Q38 40 45 16 Q78 15 82 44 Q89 14 116 20 Q116 52 79 55"
        fill="var(--color-growth)"
      />
      {stage === 'sapling' || stage === 'tree' ? (
        <path d="M67 112 Q34 106 36 84 Q62 83 67 112" fill="var(--color-growth)" />
      ) : null}
      <ellipse cx="72" cy="59" rx="28" ry="25" fill="var(--color-growth)" />
      <ellipse cx="61" cy="56" rx="7" ry="9" fill="white" />
      <ellipse cx="82" cy="56" rx="7" ry="9" fill="white" />
      <circle cx="63" cy="58" r="3.5" fill="var(--color-ink)" />
      <circle cx="80" cy="58" r="3.5" fill="var(--color-ink)" />
      <path
        d="M64 70 Q72 78 80 70"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="70" cy="101" r="11" fill="var(--color-primary)" />
      <text x="70" y="106" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">
        Р
      </text>
    </motion.svg>
  );
}
