import { Prisma } from "@prisma/client";

export type Account = {
  id: string;
  name: string;
  description: string | null;
  badgeId: string;
  initAmount: Prisma.Decimal | number;
  limit: Prisma.Decimal | number;
  typeId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateAccount = Omit<
  Account,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;
