import { z } from "zod";

export const CRYPTO_ASSETS = ["BTC", "ETH", "USDT", "BNB", "SOL"] as const;
export const cryptoAssetSchema = z.enum(CRYPTO_ASSETS);

export const cryptoSendSchema = z.object({
  asset: cryptoAssetSchema,
  address: z
    .string()
    .min(10, "Enter a valid wallet address")
    .max(120, "Address looks too long"),
  network: z.string().min(1, "Network is required"),
  amount: z
    .number({ invalid_type_error: "Enter an amount" })
    .positive("Amount must be greater than zero"),
  pin: z.string().regex(/^\d{4}$/, "Enter your 4-digit PIN"),
});

export type CryptoSendInput = z.infer<typeof cryptoSendSchema>;
