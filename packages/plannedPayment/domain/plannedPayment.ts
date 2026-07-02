import { Prisma } from "@prisma/client";

export type PlannedPayment = {
  id: string;
  accountId: string;
  categoryId: string;
  description: string | null;
  amount: number | Prisma.Decimal;
  startDate: Date;
  endDate: Date | null;
  specificDay: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePlannedPayment = Omit<
  PlannedPayment,
  "id" | "createdAt" | "updatedAt"
>;
