import { Decimal } from "@prisma/client/runtime/library";

export type Budget = {
  id: string;
  categoryId: string;
  amount: Decimal;
  badgeId: string;
  periodId: string;
  year: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBudget = Omit<Budget, "id" | "createdAt" | "updatedAt">;
