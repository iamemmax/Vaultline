import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, deduping conflicts.
 * Use everywhere component variants combine with caller-provided className.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
