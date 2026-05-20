import { z } from "zod";

export const adjustBalanceSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Enter an amount" })
    .refine((n) => n !== 0, "Amount cannot be zero"),
  reason: z
    .string()
    .min(4, "Provide a brief reason")
    .max(200, "Reason is too long"),
});
export type AdjustBalanceInput = z.infer<typeof adjustBalanceSchema>;

export const packageCrudSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  durationMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]),
  roiPercent: z
    .number()
    .min(0.1, "ROI must be greater than 0")
    .max(100, "ROI must be 100% or less"),
  minAmount: z.number().nonnegative("Min amount must be ≥ 0"),
  maxAmount: z.number().positive("Max amount must be > 0"),
  active: z.boolean(),
  description: z.string().min(4, "Description is required").max(400),
}).refine((d) => d.maxAmount > d.minAmount, {
  path: ["maxAmount"],
  message: "Max amount must be greater than min amount",
});
export type PackageCrudInput = z.infer<typeof packageCrudSchema>;

export const siteSettingsSchema = z.object({
  appName: z.string().min(1, "App name is required").max(60),
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(
      /^(hsl\(.+\)|#([0-9a-fA-F]{3,8}))$/,
      "Use a valid HSL or hex color",
    ),
  supportEmail: z.string().email("Enter a valid email"),
  maintenanceMode: z.boolean(),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const transactionRejectSchema = z.object({
  reason: z.string().min(4, "Provide a reason").max(200),
});
export type TransactionRejectInput = z.infer<typeof transactionRejectSchema>;
