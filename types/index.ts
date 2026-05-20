/**
 * Domain types — single source of truth.
 * These shapes are what the real backend MUST also return; MSW handlers
 * are typed against them so swapping to a real API is a no-op.
 */

export type UserRole = "USER" | "ADMIN";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  country: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  hasTransactionPin: boolean;
  accountNumber: string;
  balance: number; // fiat balance in minor units? — we keep as number (major units) for simplicity
  currency: string; // ISO 4217, e.g. "USD"
  createdAt: string; // ISO timestamp
  lastLoginAt?: string;
}

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "INVESTMENT"
  | "INVESTMENT_RETURN"
  | "CRYPTO_BUY"
  | "CRYPTO_SELL"
  | "CRYPTO_SEND"
  | "CRYPTO_RECEIVE"
  | "FEE";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "AWAITING_APPROVAL";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  counterparty?: string; // e.g. recipient name / wallet address
  fee?: number;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  completedAt?: string;
}

export interface InvestmentPackage {
  id: string;
  name: string;
  durationMonths: 3 | 6 | 12;
  roiPercent: number; // e.g. 18 means 18% over the full duration
  minAmount: number;
  maxAmount: number;
  active: boolean;
  description: string;
}

export type InvestmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Investment {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  durationMonths: number;
  roiPercent: number;
  principal: number;
  currency: string;
  status: InvestmentStatus;
  startedAt: string;
  maturesAt: string;
  completedAt?: string;
}

export type CryptoSymbol = "BTC" | "ETH" | "USDT" | "BNB" | "SOL";

export interface CryptoWallet {
  asset: CryptoSymbol;
  name: string;
  balance: number; // crypto units
  address: string;
  network: string;
}

export interface CryptoPrice {
  asset: CryptoSymbol;
  usd: number;
  change24h: number; // percent
  updatedAt: string;
}

export interface Session {
  id: string;
  device: string;
  ip: string;
  location?: string;
  lastActiveAt: string;
  current: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface SiteSettings {
  appName: string;
  logoUrl?: string;
  primaryColor: string; // HSL or hex
  supportEmail: string;
  maintenanceMode: boolean;
}

/* ────────────────── API envelope + error types ────────────────── */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorPayload {
  message: string;
  code: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public fieldErrors?: Record<string, string>;

  constructor(payload: ApiErrorPayload, status: number) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.status = status;
    this.fieldErrors = payload.fieldErrors;
  }
}
