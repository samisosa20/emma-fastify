import { Decimal } from "@prisma/client/runtime/library";

export type Report = {
  category: string;
  amount: number | Decimal;
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
  amount: Decimal | number | null;
}[];

export type ReportAccountBalance = {
  code: string;
  yearlyAmount: Decimal | number | null;
  monthlyAmount: Decimal | number | null;
  totalAmount: Decimal | number | null;
};

export type ReportCategoryStats = {
  code: string;
  avgMonthlyIncome: Decimal | number | null;
  incomeLowerLimit: Decimal | number | null;
  incomeUpperLimit: Decimal | number | null;
  avgMonthlyExpense: Decimal | number | null;
  expenseLowerLimit: Decimal | number | null;
  expenseUpperLimit: Decimal | number | null;
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
  dailyAmount: Decimal | number | null;
  cumulativeBalance: Decimal | number | null;
};

export type BalanceHistory = ItemBalanceHistory[];
