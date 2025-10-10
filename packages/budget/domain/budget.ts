import { Decimal } from "@prisma/client/runtime/library";

export type Budget = {
  id: string;
  categoryId: string;
  amount: Decimal | number;
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
  incomes: Decimal;
  expenses: Decimal;
  utility: Decimal;
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
  planned: Decimal | number;
  executed: Decimal | number;
  difference: Decimal | number;
};
