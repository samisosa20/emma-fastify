import { Prisma } from "@prisma/client";

export type Report = {
  categoryId: string;
  category: string;
  amount: number | Prisma.Decimal;
}[];

export type ReportParams = {
  weekNumber?: number;
  year?: number;
  badgeId?: string;
  userId?: string;
  date?: string;
  month?: number;
  accountId?: string;
  categoryId?: string;
  endDate?: string;
  startDate?: string;
};

export type ReportBalance = {
  code: string;
  amount: Prisma.Decimal | number | null;
}[];

export type ReportAccountBalance = {
  code: string;
  yearlyAmount: Prisma.Decimal | number | null;
  monthlyAmount: Prisma.Decimal | number | null;
  totalAmount: Prisma.Decimal | number | null;
};

export type ReportCategoryStats = {
  code: string;
  avgMonthlyIncome: Prisma.Decimal | number | null;
  incomeLowerLimit: Prisma.Decimal | number | null;
  incomeUpperLimit: Prisma.Decimal | number | null;
  avgMonthlyExpense: Prisma.Decimal | number | null;
  expenseLowerLimit: Prisma.Decimal | number | null;
  expenseUpperLimit: Prisma.Decimal | number | null;
}[];

export type ReportBalanceHistory = {
  current: BalanceHistory;
  lastYear: BalanceHistory;
  previousPeriod: BalanceHistory;
};

export type ItemBalanceHistory = {
  badgeId: string;
  code: string;
  flag: string;
  symbol: string;
  date: string | Date;
  dailyAmount: Prisma.Decimal | number | null;
  cumulativeBalance: Prisma.Decimal | number | null;
};

export type BalanceHistory = ItemBalanceHistory[];

export type DistributionSummary = {
  targetPercentage: number;
  targetAmount: number;
  actualAmount: number;
  actualPercentage: number;
};

export type CategoryExpense = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  groupName: string;
  ruleGroup: "fijos" | "personales" | "ahorros";
  amount: number;
  participation: number;
};

export type ReportIncomeDistribution = {
  badgeId: string;
  badgeCode: string;
  badgeSymbol: string;
  totalIncome: number;
  totalExpenses: number;
  fijos: DistributionSummary;
  personales: DistributionSummary;
  ahorros: DistributionSummary;
  categories: CategoryExpense[];
};
