/**
 * Centralized endpoint paths. MSW handlers and React Query hooks both
 * import from here, so renaming an endpoint is a one-line change.
 */

export const endpoints = {
  // Auth
  register: "/auth/register",
  login: "/auth/login",
  logout: "/auth/logout",
  verifyEmail: "/auth/verify-email",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  changePassword: "/auth/change-password",
  me: "/auth/me",
  twoFactorSetup: "/auth/2fa/setup",
  twoFactorVerify: "/auth/2fa/verify",
  twoFactorDisable: "/auth/2fa/disable",
  setPin: "/auth/pin/set",
  verifyPin: "/auth/pin/verify",

  // User
  userUpdate: "/users/me/update",
  sessions: "/users/sessions",
  revokeSession: (id: string) => `/users/sessions/${id}`,

  // Transactions
  transactions: "/transactions",
  transaction: (id: string) => `/transactions/${id}`,

  // Transfers
  transfers: "/transfers",
  beneficiaries: "/transfers/beneficiaries",

  // Investments
  investmentPackages: "/investments/packages",
  investments: "/investments",
  investment: (id: string) => `/investments/${id}`,

  // Crypto
  cryptoWallets: "/crypto/wallets",
  cryptoPrices: "/crypto/prices",
  cryptoSend: "/crypto/send",
  cryptoReceive: "/crypto/receive",

  // Admin
  adminStats: "/admin/stats",
  adminUsers: "/admin/users",
  adminUser: (id: string) => `/admin/users/${id}`,
  adminAdjustBalance: (id: string) => `/admin/users/${id}/adjust-balance`,
  adminPendingTransactions: "/admin/transactions/pending",
  adminApproveTransaction: (id: string) => `/admin/transactions/${id}/approve`,
  adminRejectTransaction: (id: string) => `/admin/transactions/${id}/reject`,
  adminPackages: "/admin/investments/packages",
  adminPackage: (id: string) => `/admin/investments/packages/${id}`,
  adminSettings: "/admin/settings",
  adminAuditLog: "/admin/audit-log",
} as const;
