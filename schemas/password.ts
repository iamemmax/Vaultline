import { z } from "zod";

/**
 * Password requirements shared by register / reset / change flows.
 * Mirrors the rule in the spec; export both the schema and a passwordChecks
 * helper used by the PasswordStrengthMeter so the same rules drive UI + validation.
 */

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a symbol");

export interface PasswordCheck {
  label: string;
  test: (value: string) => boolean;
}

export const passwordChecks: PasswordCheck[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Number", test: (v) => /[0-9]/.test(v) },
  { label: "Symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function passwordStrength(value: string): {
  score: number; // 0..4
  passed: number;
  total: number;
} {
  const passed = passwordChecks.filter((c) => c.test(value)).length;
  return { score: Math.max(0, passed - 1), passed, total: passwordChecks.length };
}
