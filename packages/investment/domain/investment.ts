import { Decimal } from "@prisma/client/runtime/library";

export type Investment = {
  id: string;
  name: string;
  initAmount: Decimal | number;
  endAmount: Decimal | number;
  badgeId: string;
  dateInvestment: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateInvestment = Omit<
  Investment,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;
