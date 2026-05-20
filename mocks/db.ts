import { faker } from "@faker-js/faker";

import type {
  AuditLogEntry,
  CryptoPrice,
  CryptoSymbol,
  CryptoWallet,
  Investment,
  InvestmentPackage,
  Session,
  SiteSettings,
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
} from "@/types";

/**
 * In-memory "database" for MSW. Persisted to localStorage so refreshes
 * keep state. Resetting is a one-liner from the dev console:
 *   localStorage.removeItem("ft.mock.db") && location.reload()
 */

const STORAGE_KEY = "ft.mock.db";
const SCHEMA_VERSION = 3;

// Auth-only data the handlers need but doesn't belong in the public types.
export interface MockCredentials {
  userId: string;
  passwordHash: string; // plaintext is fine — this is a mock
  pinHash?: string;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  failedAttempts: number;
  lockedUntil?: string;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpiresAt?: string;
}

export interface MockToken {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface MockDB {
  version: number;
  users: User[];
  credentials: MockCredentials[];
  tokens: MockToken[];
  sessions: Session[];
  transactions: Transaction[];
  investmentPackages: InvestmentPackage[];
  investments: Investment[];
  cryptoWallets: Record<string, CryptoWallet[]>; // userId → wallets
  cryptoPrices: CryptoPrice[];
  auditLog: AuditLogEntry[];
  siteSettings: SiteSettings;
  beneficiaries: Record<string, Array<{ id: string; name: string; accountNumber: string }>>;
}

/* ────────────────────────── Seeding helpers ────────────────────────── */

// Deterministic across page loads → stable demo experience
faker.seed(424242);

function makeAccountNumber() {
  return faker.string.numeric({ length: 10 });
}

function makeWalletAddress(symbol: CryptoSymbol) {
  if (symbol === "BTC") return `bc1q${faker.string.alphanumeric({ length: 38, casing: "lower" })}`;
  if (symbol === "ETH" || symbol === "USDT" || symbol === "BNB")
    return `0x${faker.string.hexadecimal({ length: 40, prefix: "", casing: "lower" })}`;
  return faker.string.alphanumeric({ length: 44 });
}

function defaultCryptoWallets(): CryptoWallet[] {
  const assets: { asset: CryptoSymbol; name: string; network: string; balance: number }[] = [
    { asset: "BTC", name: "Bitcoin", network: "Bitcoin", balance: 0.0427 },
    { asset: "ETH", name: "Ethereum", network: "Ethereum", balance: 0.812 },
    { asset: "USDT", name: "Tether", network: "Ethereum (ERC-20)", balance: 1240.5 },
    { asset: "BNB", name: "BNB", network: "BNB Smart Chain", balance: 3.21 },
    { asset: "SOL", name: "Solana", network: "Solana", balance: 18.7 },
  ];
  return assets.map((a) => ({ ...a, address: makeWalletAddress(a.asset) }));
}

function defaultCryptoPrices(): CryptoPrice[] {
  const base: Record<CryptoSymbol, number> = {
    BTC: 67_400,
    ETH: 3_240,
    USDT: 1,
    BNB: 612,
    SOL: 178,
  };
  return (Object.keys(base) as CryptoSymbol[]).map((asset) => ({
    asset,
    usd: base[asset],
    change24h: faker.number.float({ min: -4, max: 4, fractionDigits: 2 }),
    updatedAt: new Date().toISOString(),
  }));
}

function defaultPackages(): InvestmentPackage[] {
  return [
    {
      id: "pkg_starter",
      name: "Starter — 3 Month Lock",
      durationMonths: 3,
      roiPercent: 8,
      minAmount: 100,
      maxAmount: 5_000,
      active: true,
      description:
        "A gentle on-ramp. Lock funds for 90 days and earn a steady 8% return at maturity.",
    },
    {
      id: "pkg_growth",
      name: "Growth — 6 Month Lock",
      durationMonths: 6,
      roiPercent: 18,
      minAmount: 500,
      maxAmount: 25_000,
      active: true,
      description: "Our most popular tier. Balanced lock period with 18% total ROI.",
    },
    {
      id: "pkg_elite",
      name: "Elite — 12 Month Lock",
      durationMonths: 12,
      roiPercent: 40,
      minAmount: 1_000,
      maxAmount: 100_000,
      active: true,
      description: "Maximum yield for committed investors. 40% ROI over a full year.",
    },
  ];
}

function seedDemoUser(): { user: User; creds: MockCredentials } {
  const id = "usr_demo_user";
  const user: User = {
    id,
    email: "demo@vaultline.app",
    fullName: "Alex Morgan",
    phone: "+1 555 0173",
    country: "United States",
    role: "USER",
    status: "ACTIVE",
    twoFactorEnabled: false,
    hasTransactionPin: true,
    accountNumber: "0017284593",
    balance: 24_581.32,
    currency: "USD",
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  const creds: MockCredentials = {
    userId: id,
    passwordHash: "Password1!", // demo password
    pinHash: "1234",
    failedAttempts: 0,
  };
  return { user, creds };
}

function seedDemoAdmin(): { user: User; creds: MockCredentials } {
  const id = "usr_demo_admin";
  const user: User = {
    id,
    email: "admin@vaultline.app",
    fullName: "Jordan Reeves",
    phone: "+1 555 0102",
    country: "United States",
    role: "ADMIN",
    status: "ACTIVE",
    twoFactorEnabled: false,
    hasTransactionPin: true,
    accountNumber: "0000000001",
    balance: 0,
    currency: "USD",
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  const creds: MockCredentials = {
    userId: id,
    passwordHash: "Admin123!",
    pinHash: "1234",
    failedAttempts: 0,
  };
  return { user, creds };
}

function seedExtraUsers(count: number): { users: User[]; creds: MockCredentials[] } {
  const users: User[] = [];
  const creds: MockCredentials[] = [];
  for (let i = 0; i < count; i++) {
    const id = `usr_${faker.string.alphanumeric({ length: 10, casing: "lower" })}`;
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const user: User = {
      id,
      email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
      fullName: `${first} ${last}`,
      phone: faker.phone.number(),
      country: faker.location.country(),
      role: "USER",
      status: faker.helpers.weightedArrayElement([
        { weight: 8, value: "ACTIVE" },
        { weight: 1, value: "PENDING" },
        { weight: 1, value: "SUSPENDED" },
      ]),
      twoFactorEnabled: faker.datatype.boolean({ probability: 0.3 }),
      hasTransactionPin: faker.datatype.boolean({ probability: 0.85 }),
      accountNumber: makeAccountNumber(),
      balance: faker.number.float({ min: 0, max: 50_000, fractionDigits: 2 }),
      currency: "USD",
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      lastLoginAt: faker.date.recent({ days: 30 }).toISOString(),
    };
    users.push(user);
    creds.push({
      userId: id,
      passwordHash: "Password1!",
      pinHash: "1234",
      failedAttempts: 0,
    });
  }
  return { users, creds };
}

function seedTransactionsFor(userId: string, count: number): Transaction[] {
  const types: TransactionType[] = [
    "DEPOSIT",
    "WITHDRAWAL",
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "INVESTMENT",
    "INVESTMENT_RETURN",
    "CRYPTO_BUY",
    "CRYPTO_SEND",
    "FEE",
  ];
  const statuses: TransactionStatus[] = ["COMPLETED", "COMPLETED", "COMPLETED", "PENDING", "FAILED"];

  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.arrayElement(types);
    const status = faker.helpers.arrayElement(statuses);
    const isCredit =
      type === "DEPOSIT" || type === "TRANSFER_IN" || type === "INVESTMENT_RETURN";
    const baseAmount = faker.number.float({ min: 12, max: 4_200, fractionDigits: 2 });
    const amount = isCredit ? baseAmount : -baseAmount;
    const createdAt = faker.date.recent({ days: 90 }).toISOString();
    return {
      id: `tx_${faker.string.alphanumeric({ length: 12, casing: "lower" })}`,
      userId,
      type,
      status,
      amount,
      currency: "USD",
      description: descriptionFor(type),
      reference: `REF${faker.string.numeric({ length: 8 })}`,
      counterparty: faker.person.fullName(),
      fee: type === "CRYPTO_SEND" || type === "WITHDRAWAL" ? 0.99 : undefined,
      createdAt,
      completedAt: status === "COMPLETED" ? createdAt : undefined,
      metadata: i === 0 ? { source: "demo" } : undefined,
    } satisfies Transaction;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function descriptionFor(type: TransactionType): string {
  switch (type) {
    case "DEPOSIT":
      return "Bank deposit";
    case "WITHDRAWAL":
      return "Withdrawal to linked bank";
    case "TRANSFER_IN":
      return "Transfer received";
    case "TRANSFER_OUT":
      return "Transfer sent";
    case "INVESTMENT":
      return "Locked investment created";
    case "INVESTMENT_RETURN":
      return "Investment matured — principal + ROI";
    case "CRYPTO_BUY":
      return "Crypto purchase";
    case "CRYPTO_SELL":
      return "Crypto sale";
    case "CRYPTO_SEND":
      return "Crypto sent on-chain";
    case "CRYPTO_RECEIVE":
      return "Crypto received";
    case "FEE":
      return "Network / service fee";
  }
}

function defaultSiteSettings(): SiteSettings {
  return {
    appName: "Vaultline",
    primaryColor: "hsl(221 83% 53%)",
    supportEmail: "support@vaultline.app",
    maintenanceMode: false,
  };
}

function seedExtraInvestments(
  users: User[],
  packages: InvestmentPackage[],
  count: number,
): Investment[] {
  const investors = users.filter((u) => u.role === "USER");
  if (investors.length === 0 || packages.length === 0) return [];
  return Array.from({ length: count }, () => {
    const pkg = faker.helpers.arrayElement(packages);
    const investor = faker.helpers.arrayElement(investors);
    const startedAt = faker.date.recent({ days: 90 }).toISOString();
    const maturesAt = new Date(
      new Date(startedAt).getTime() + pkg.durationMonths * 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const principal = faker.number.float({
      min: pkg.minAmount,
      max: Math.min(pkg.maxAmount, pkg.minAmount * 20),
      fractionDigits: 2,
    });
    const isMature = new Date(maturesAt).getTime() < Date.now();
    return {
      id: `inv_${faker.string.alphanumeric({ length: 10, casing: "lower" })}`,
      userId: investor.id,
      packageId: pkg.id,
      packageName: pkg.name,
      durationMonths: pkg.durationMonths,
      roiPercent: pkg.roiPercent,
      principal,
      currency: "USD",
      status: isMature ? "COMPLETED" : "ACTIVE",
      startedAt,
      maturesAt,
      completedAt: isMature ? maturesAt : undefined,
    } satisfies Investment;
  });
}

function seedAuditLog(users: User[], count: number): AuditLogEntry[] {
  const admins = users.filter((u) => u.role === "ADMIN");
  const targets = users.filter((u) => u.role === "USER");
  if (admins.length === 0 || targets.length === 0) return [];

  const actions = [
    "USER_SUSPENDED",
    "USER_REACTIVATED",
    "USER_2FA_RESET",
    "BALANCE_ADJUSTED",
    "TRANSACTION_APPROVED",
    "TRANSACTION_REJECTED",
    "PACKAGE_CREATED",
    "PACKAGE_UPDATED",
    "PACKAGE_DELETED",
    "SETTINGS_UPDATED",
    "ADMIN_LOGIN",
  ] as const;

  // Weight common actions higher so the chart looks realistic.
  const weighted = faker.helpers.weightedArrayElement.bind(faker.helpers);

  return Array.from({ length: count }, () => {
    const actor = faker.helpers.arrayElement(admins);
    const action = weighted([
      { weight: 5, value: "TRANSACTION_APPROVED" },
      { weight: 3, value: "ADMIN_LOGIN" },
      { weight: 2, value: "BALANCE_ADJUSTED" },
      { weight: 2, value: "USER_SUSPENDED" },
      { weight: 2, value: "USER_REACTIVATED" },
      { weight: 1, value: "TRANSACTION_REJECTED" },
      { weight: 1, value: "USER_2FA_RESET" },
      { weight: 1, value: "PACKAGE_UPDATED" },
      { weight: 1, value: "SETTINGS_UPDATED" },
    ] as { weight: number; value: (typeof actions)[number] }[]);

    const target =
      action === "SETTINGS_UPDATED" || action === "ADMIN_LOGIN"
        ? undefined
        : faker.helpers.arrayElement(targets).id;

    let metadata: Record<string, string | number> | undefined;
    if (action === "BALANCE_ADJUSTED") {
      metadata = {
        amount: faker.number.float({ min: -2_500, max: 2_500, fractionDigits: 2 }),
        reason: faker.lorem.words({ min: 2, max: 5 }),
      };
    } else if (action === "TRANSACTION_REJECTED") {
      metadata = { reason: faker.lorem.words(4) };
    }

    return {
      id: `aud_${faker.string.alphanumeric({ length: 10, casing: "lower" })}`,
      actorId: actor.id,
      actorName: actor.fullName,
      action,
      target,
      metadata,
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    } satisfies AuditLogEntry;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ────────────────────────── Build the DB ────────────────────────── */

function buildFresh(): MockDB {
  const { user: demoUser, creds: demoCreds } = seedDemoUser();
  const { user: adminUser, creds: adminCreds } = seedDemoAdmin();
  const { users: extras, creds: extraCreds } = seedExtraUsers(36);

  const allUsers = [demoUser, adminUser, ...extras];
  const allCreds = [demoCreds, adminCreds, ...extraCreds];

  const transactions: Transaction[] = [];
  for (const u of allUsers) {
    if (u.role === "ADMIN") continue;
    transactions.push(...seedTransactionsFor(u.id, faker.number.int({ min: 8, max: 32 })));
  }

  // Active demo investment so the dashboard countdown has something to render
  const startedAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(); // 21 days ago
  const maturesAt = new Date(
    new Date(startedAt).getTime() + 1000 * 60 * 60 * 24 * 90,
  ).toISOString();
  const demoInvestment: Investment = {
    id: "inv_demo_001",
    userId: demoUser.id,
    packageId: "pkg_starter",
    packageName: "Starter — 3 Month Lock",
    durationMonths: 3,
    roiPercent: 8,
    principal: 2_500,
    currency: "USD",
    status: "ACTIVE",
    startedAt,
    maturesAt,
  };

  const pkgs = defaultPackages();
  const investments: Investment[] = [
    demoInvestment,
    ...seedExtraInvestments(allUsers, pkgs, 48),
  ];

  return {
    version: SCHEMA_VERSION,
    users: allUsers,
    credentials: allCreds,
    tokens: [],
    sessions: [],
    transactions,
    investmentPackages: pkgs,
    investments,
    cryptoWallets: { [demoUser.id]: defaultCryptoWallets() },
    cryptoPrices: defaultCryptoPrices(),
    auditLog: seedAuditLog(allUsers, 90),
    siteSettings: defaultSiteSettings(),
    beneficiaries: {},
  };
}

/* ────────────────────────── Singleton ────────────────────────── */

let cached: MockDB | null = null;

export function getDB(): MockDB {
  if (cached) return cached;

  if (typeof window === "undefined") {
    cached = buildFresh();
    return cached;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MockDB;
      if (parsed.version === SCHEMA_VERSION) {
        cached = parsed;
        return cached;
      }
    } catch {
      // fallthrough to rebuild
    }
  }
  cached = buildFresh();
  persist();
  return cached;
}

export function persist() {
  if (typeof window === "undefined" || !cached) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // Quota exceeded — silently drop; mock data isn't critical
  }
}

export function resetDB() {
  cached = buildFresh();
  persist();
}

/* ────────────────────────── Convenience queries ────────────────────────── */

export function findUserById(id: string): User | undefined {
  return getDB().users.find((u) => u.id === id);
}

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.toLowerCase();
  return getDB().users.find((u) => u.email.toLowerCase() === normalized);
}

export function findCredsByUserId(id: string): MockCredentials | undefined {
  return getDB().credentials.find((c) => c.userId === id);
}

export function findUserByToken(token: string): User | undefined {
  const db = getDB();
  const t = db.tokens.find((x) => x.token === token);
  if (!t) return undefined;
  if (new Date(t.expiresAt).getTime() < Date.now()) return undefined;
  return db.users.find((u) => u.id === t.userId);
}

export function issueToken(userId: string): string {
  const db = getDB();
  const token = `tok_${faker.string.alphanumeric({ length: 40, casing: "mixed" })}`;
  db.tokens.push({
    token,
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  persist();
  return token;
}

export function revokeToken(token: string) {
  const db = getDB();
  db.tokens = db.tokens.filter((t) => t.token !== token);
  persist();
}

export function logAudit(entry: Omit<AuditLogEntry, "id" | "createdAt">) {
  const db = getDB();
  db.auditLog.unshift({
    ...entry,
    id: `aud_${faker.string.alphanumeric({ length: 10, casing: "lower" })}`,
    createdAt: new Date().toISOString(),
  });
  persist();
}
