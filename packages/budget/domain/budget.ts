import { Prisma } from "@prisma/client";

export type Budget = {
  id: string;
  categoryId: string;
  amount: Prisma.Decimal | number;
  badgeId: string;
  periodId: string;
  year: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBudget = Omit<Budget, "id" | "createdAt" | "updatedAt">;

export type ParamsBudget = {
  year?: number;
  userId?: string;
  badgeId?: string;
};
export type BudgetByYear = {
  year: number;
  incomes: Prisma.Decimal;
  expenses: Prisma.Decimal;
  utility: Prisma.Decimal;
  badge: {
    flag: string | null;
    name: string;
    code: string;
    symbol: string | null;
  };
};

export type BudgetSummaryByBadge = {
  badge: string;
  years: BudgetByYear[];
};

export type BudgetCompare = {
  id: string;
  category: any;
  badge: any;
  year: number;
  planned: Prisma.Decimal | number;
  executed: Prisma.Decimal | number;
  difference: Prisma.Decimal | number;
};
