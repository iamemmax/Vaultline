import { z } from "zod";

export const internalTransferSchema = z.object({
  recipient: z
    .string()
    .min(3, "Enter the recipient's account number or email")
    .max(120),
  amount: z
    .number({ invalid_type_error: "Enter an amount" })
    .positive("Amount must be greater than zero")
    .max(1_000_000, "Amount exceeds the per-transfer limit"),
  note: z.string().max(120, "Note is too long").optional().or(z.literal("")),
  pin: z.string().regex(/^\d{4}$/, "Enter your 4-digit PIN"),
});

export type InternalTransferInput = z.infer<typeof internalTransferSchema>;
