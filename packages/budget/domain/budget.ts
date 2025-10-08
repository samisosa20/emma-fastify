import { Decimal } from "@prisma/client/runtime/library";
import { symbol } from "zod";

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
};
export type BudgetByYear = {
  year: number;
  incomes: number;
  expenses: number;
  utility: number;
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
