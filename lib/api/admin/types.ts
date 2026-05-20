export interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  activeInvestmentValue: number;
  activeInvestmentCount: number;
  pendingApprovals: number;
  last24hVolume: number;
  trend: { date: string; volume: number; users: number }[];
}
