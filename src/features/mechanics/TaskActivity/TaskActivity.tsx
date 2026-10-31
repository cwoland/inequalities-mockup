'use client';

import { useState, type ReactNode } from 'react';
import type { Task, TaskSlot } from '@/features/lesson/types';
import { buildTask } from '@/features/lesson/taskFactory';
import type { Difficulty } from '@/lib/math/generator';
import {
  compareNumbers,
  evaluate,
  formatBoxInequality,
  formatExpr,
  holdsFor,
  relationSigns,
  substitute,
  universeValues,
  type Relation,
} from '@/lib/math/inequality';
import {
  formatSolution,
  sameSolution,
  solutionSet,
  solve,
  type SolutionSet,
} from '@/lib/math/numberLine';
import type { MechanicControl } from '../types';
import { feedbackFor, hintFor } from './taskFeedback';
import styles from './TaskActivity.module.css';

const titles: Record<Task['kind'], string> = {
  compareQuick: 'Выбери знак',
  dropTest: 'Полей грядку',
  numberLineBuild: 'Построй забор',
  balanceSolve: 'Какая чаша тяжелее?',
  pickLine: 'Найди подходящую грядку',
  pickNumbers: 'Выбери все подходящие числа',
  findBug: 'Помоги Путанику',
};

function Line({ set }: { set: SolutionSet }) {
  return (
    <span
      className={styles.line}
      aria-label={`Отмечены числа: ${formatSolution(set)}`}
    >
      {universeValues(set.universe).map((value) => (
        <span
          key={value}
          className={`${styles.point} ${
            set.values.includes(value) ? styles.active : ''
          }`}
        >
          {value}
        </span>
      ))}
    </span>
  );
}

export function TaskActivity({
  slot,
  difficulty,
  control,
}: {
  slot: TaskSlot;
  difficulty: Difficulty;
  control: MechanicControl;
}) {
  const [task] = useState(() => buildTask(slot, difficulty));
  const [selected, setSelected] = useState<number[]>([]);
  const [tested, setTested] = useState<number[]>([]);
  const [lastDrop, setLastDrop] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | Relation | null>(null);
  const [range, setRange] = useState(() =>
    'inequality' in task
      ? {
          from: task.inequality.universe.min,
          to: task.inequality.universe.max,
        }
      : { from: 0, to: 10 },
  );

  const locked = control.phase.kind === 'review';
  const reveal =
    control.phase.kind === 'review' &&
    (control.phase.correct || control.phase.revealed);

  const draftValues =
    task.kind === 'numberLineBuild'
      ? universeValues(task.inequality.universe).filter(
          (value) => value >= range.from && value <= range.to,
        )
      : selected;

  const answer = (correct: boolean) => {
    if (!locked) {
      control.onAnswer(correct);
    }
  };

  const toggle = (value: number) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  let activity: ReactNode;

  if (task.kind === 'compareQuick' || task.kind === 'balanceSolve') {
    const pair = task.kind === 'compareQuick' ? task.pair : task;
    const relation = compareNumbers(evaluate(pair.left), evaluate(pair.right));
    const tilt = reveal
      ? relation === 'lt'
        ? -10
        : relation === 'gt'
          ? 10
          : 0
      : 0;

    activity = (
      <>
        <p className={`${styles.question} num`}>
          {formatExpr(pair.left)} ? {formatExpr(pair.right)}
        </p>

        {task.kind === 'balanceSolve' ? (
          <svg
            className={styles.balance}
            viewBox="0 0 400 205"
            role="img"
            aria-label={
              reveal
                ? `Весы показывают: ${relationSigns[relation]}`
                : 'Выбери знак, чтобы проверить весы'
            }
          >
            <path
              d="M200 60V184 M155 184H245"
              stroke="var(--color-soil)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <g
              className={styles.beam}
              style={{ transform: `rotate(${tilt}deg)` }}
            >
              <path
                d="M55 65H345"
                stroke="var(--color-primary)"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M55 65L20 132H90Z M345 65L310 132H380Z"
                fill="none"
                stroke="var(--color-soil)"
                strokeWidth="3"
              />
              <path
                d="M15 132Q55 181 95 132Z M305 132Q345 181 385 132Z"
                fill="var(--color-primary-soft)"
                stroke="var(--color-primary)"
                strokeWidth="3"
              />
            </g>
            <circle
              cx="200"
              cy="65"
              r="10"
              fill="var(--color-sun)"
            />
          </svg>
        ) : null}

        <div className={styles.choices}>
          {(['lt', 'eq', 'gt'] as const).map((sign) => (
            <button
              key={sign}
              type="button"
              className={styles.choice}
              disabled={locked}
              aria-pressed={chosen === sign}
              aria-label={
                sign === 'lt' ? 'Меньше' : sign === 'gt' ? 'Больше' : 'Равно'
              }
              onClick={() => {
                setChosen(sign);
                answer(sign === relation);
              }}
            >
              {relationSigns[sign]}
            </button>
          ))}
        </div>
      </>
    );
  } else if (task.kind === 'findBug') {
    activity = (
      <>
        <p className={styles.muted}>{task.question}</p>
        <div className={styles.options}>
          {task.steps.map((step, index) => (
            <button
              key={index}
              type="button"
              className={styles.option}
              disabled={locked}
              aria-pressed={chosen === index}
              onClick={() => {
                setChosen(index);
                answer(index === task.bugIndex);
              }}
            >
              <span>
                {index + 1}. {step.expression}
              </span>
              <span className={styles.muted}>{step.note}</span>
            </button>
          ))}
        </div>
      </>
    );
  } else {
    const inequality = task.inequality;
    const values = universeValues(inequality.universe);
    const expected = solve(inequality);
    const rangeSet = solutionSet(inequality.universe, draftValues);
    const canFinishExploring =
      tested.length >= Math.min(5, values.length) &&
      tested.some((value) => holdsFor(inequality, value)) &&
      tested.some((value) => !holdsFor(inequality, value));

    const dropFeedback =
      lastDrop === null
        ? null
        : (() => {
            const result = substitute(inequality, lastDrop);
            const valid = holdsFor(inequality, lastDrop);

            return (
              `${result.left} ${relationSigns[inequality.relation]} ` +
              `${result.right} — ` +
              (valid
                ? 'верно, растёт росток!'
                : 'неверно, это число не подходит.')
            );
          })();

    activity = (
      <>
        <p className={`${styles.question} num`}>
          {formatBoxInequality(inequality)}
        </p>

        <p className={styles.muted}>
          На этой грядке — только целые числа от {inequality.universe.min} до{' '}
          {inequality.universe.max}.
        </p>

        {task.kind === 'pickLine' ? (
          <div className={styles.options}>
            {task.options.map((option, index) => (
              <button
                key={index}
                type="button"
                className={styles.option}
                aria-pressed={chosen === index}
                disabled={locked}
                onClick={() => {
                  setChosen(index);
                  answer(index === task.correctIndex);
                }}
              >
                <span>Грядка {index + 1}</span>
                <Line set={option} />
              </button>
            ))}
          </div>
        ) : task.kind === 'numberLineBuild' ? (
          <>
            <p className={styles.muted}>
              Огороди все подходящие числа: передвигай начало и конец забора.
            </p>

            <Line set={rangeSet} />

            <div className={styles.ranges}>
              <label>
                Начало: {range.from}
                <input
                  type="range"
                  min={inequality.universe.min}
                  max={inequality.universe.max}
                  step={1}
                  value={range.from}
                  disabled={locked}
                  onChange={(event) => {
                    const from = Number(event.target.value);
                    setRange((current) => ({
                      from,
                      to: Math.max(from, current.to),
                    }));
                  }}
                />
              </label>

              <label>
                Конец: {range.to}
                <input
                  type="range"
                  min={inequality.universe.min}
                  max={inequality.universe.max}
                  step={1}
                  value={range.to}
                  disabled={locked}
                  onChange={(event) => {
                    const to = Number(event.target.value);
                    setRange((current) => ({
                      from: Math.min(to, current.from),
                      to,
                    }));
                  }}
                />
              </label>
            </div>

            <button
              type="button"
              className={styles.primary}
              disabled={locked}
              onClick={() => answer(sameSolution(rangeSet, expected))}
            >
              Проверить забор
            </button>
          </>
        ) : (
          <>
            <p className={styles.muted}>
              {task.kind === 'dropTest'
                ? 'Нажми на число, чтобы полить его. Проверь хотя бы пять чисел: найди и подходящие, и неподходящие.'
                : 'Нажимай на числа, которые подходят в окошко. Повторное нажатие убирает выбор.'}
            </p>

            <div className={styles.garden}>
              {values.map((value) => {
                const watered = tested.includes(value);
                const picked = selected.includes(value);
                const valid = holdsFor(inequality, value);

                const symbol =
                  task.kind === 'dropTest'
                    ? watered
                      ? valid
                        ? '🌱'
                        : '·'
                      : '💧'
                    : picked
                      ? '🌱'
                      : '·';

                return (
                  <button
                    key={value}
                    type="button"
                    className={styles.number}
                    disabled={locked}
                    aria-pressed={
                      task.kind === 'dropTest' ? watered : picked
                    }
                    aria-label={
                      task.kind === 'dropTest'
                        ? `${value}: ${
                            watered
                              ? valid
                                ? 'подходит'
                                : 'не подходит'
                              : 'полить'
                          }`
                        : String(value)
                    }
                    onClick={() => {
                      if (task.kind === 'dropTest') {
                        setTested((current) =>
                          current.includes(value)
                            ? current
                            : [...current, value],
                        );
                        setLastDrop(value);
                      } else {
                        toggle(value);
                      }
                    }}
                  >
                    <span className={styles.sprout} aria-hidden="true">
                      {symbol}
                    </span>
                    <span>{value}</span>
                  </button>
                );
              })}
            </div>

            {task.kind === 'dropTest' && dropFeedback !== null ? (
              <p role="status">{dropFeedback}</p>
            ) : null}

            <button
              type="button"
              className={styles.primary}
              disabled={
                locked ||
                (task.kind === 'dropTest'
                  ? !canFinishExploring
                  : selected.length === 0)
              }
              onClick={() =>
                answer(
                  task.kind === 'dropTest'
                    ? canFinishExploring
                    : sameSolution(
                        solutionSet(inequality.universe, selected),
                        expected,
                      ),
                )
              }
            >
              {task.kind === 'dropTest'
                ? 'Я заметил, где растёт!'
                : 'Проверить числа'}
            </button>
          </>
        )}
      </>
    );
  }

  return (
    <section className={styles.card} aria-label={titles[task.kind]}>
      <h2 className={styles.title}>{titles[task.kind]}</h2>
      {activity}

      {control.phase.kind === 'answering' && control.phase.hintUsed ? (
        <p className={styles.hint}>💧 {hintFor(task)}</p>
      ) : null}

      {locked ? (
        <p className={styles.review} role="status">
          {feedbackFor(task, { chosen, values: draftValues }, reveal)}
        </p>
      ) : null}
    </section>
  );
}