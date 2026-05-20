"use client";

import { useEffect, useState } from "react";

/**
 * Countdown to a target ISO date. Single setInterval, cleaned up on unmount.
 * Returns days/hours/minutes/seconds + percent progress from a known start.
 */

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
  /** 0..100 progress between startedAt (if provided) and targetDate. */
  progressPercent: number;
  /** Milliseconds remaining (clamped to ≥ 0). */
  remainingMs: number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function useCountdown(
  targetDate: string | Date | undefined,
  startedAt?: string | Date,
): CountdownState {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    if (target <= Date.now()) {
      setNow(Date.now());
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true,
      progressPercent: 100,
      remainingMs: 0,
    };
  }

  const target = new Date(targetDate).getTime();
  const remainingMs = Math.max(0, target - now);
  const isComplete = remainingMs === 0;

  const days = Math.floor(remainingMs / DAY);
  const hours = Math.floor((remainingMs % DAY) / HOUR);
  const minutes = Math.floor((remainingMs % HOUR) / MINUTE);
  const seconds = Math.floor((remainingMs % MINUTE) / SECOND);

  let progressPercent = 0;
  if (startedAt) {
    const start = new Date(startedAt).getTime();
    const total = target - start;
    if (total > 0) {
      const elapsed = now - start;
      progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }
  } else {
    progressPercent = isComplete ? 100 : 0;
  }

  return { days, hours, minutes, seconds, isComplete, progressPercent, remainingMs };
}
