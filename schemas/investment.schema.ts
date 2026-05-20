import { z } from "zod";

export const createInvestmentSchema = z.object({
  packageId: z.string().min(1, "Choose a package"),
  amount: z
    .number({ invalid_type_error: "Enter an amount" })
    .positive("Amount must be greater than zero"),
  acceptTerms: z.literal<true>(true, {
    errorMap: () => ({
      message: "You must acknowledge the lock period to proceed",
    }),
  }),
  pin: z.string().regex(/^\d{4}$/, "Enter your 4-digit PIN"),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
