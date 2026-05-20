import { z } from "zod";

import { passwordSchema } from "@/schemas/password";

/* ─────────────── Register ─────────────── */

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Please enter your full name")
      .max(100, "Name is too long"),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .min(7, "Enter a valid phone number")
      .max(20, "Phone number is too long"),
    country: z.string().min(2, "Country is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal<true>(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/* ─────────────── Login ─────────────── */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

/* ─────────────── Forgot / Reset ─────────────── */

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/* ─────────────── Change password ─────────────── */

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "New password must differ from current",
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/* ─────────────── Verify email ─────────────── */

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/* ─────────────── OTP / 2FA ─────────────── */

export const verifyOtpSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const twoFactorSetupSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your app"),
});
export type TwoFactorSetupInput = z.infer<typeof twoFactorSetupSchema>;

export const twoFactorChallengeSchema = z.object({
  code: z
    .string()
    .min(6, "Enter your 6-digit code or recovery code")
    .max(20, "Code is too long"),
});
export type TwoFactorChallengeInput = z.infer<typeof twoFactorChallengeSchema>;

export const twoFactorDisableSchema = z.object({
  password: z.string().min(1, "Enter your password to disable 2FA"),
});
export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableSchema>;

/* ─────────────── Transaction PIN ─────────────── */

export const transactionPinSchema = z
  .object({
    pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
    confirmPin: z.string(),
  })
  .refine((d) => d.pin === d.confirmPin, {
    path: ["confirmPin"],
    message: "PINs do not match",
  });
export type TransactionPinInput = z.infer<typeof transactionPinSchema>;

export const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "Enter your 4-digit PIN"),
});
export type VerifyPinInput = z.infer<typeof verifyPinSchema>;
