import { adminHandlers } from "@/mocks/handlers/admin";
import { authHandlers } from "@/mocks/handlers/auth";
import { cryptoHandlers } from "@/mocks/handlers/crypto";
import { investmentsHandlers } from "@/mocks/handlers/investments";
import { transactionsHandlers } from "@/mocks/handlers/transactions";
import { transfersHandlers } from "@/mocks/handlers/transfers";
import { userHandlers } from "@/mocks/handlers/user";

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...transactionsHandlers,
  ...transfersHandlers,
  ...investmentsHandlers,
  ...cryptoHandlers,
  ...adminHandlers,
];
