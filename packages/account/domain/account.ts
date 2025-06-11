import { Decimal } from "@prisma/client/runtime/library";

export type Account = {
  id: string;
  name: string;
  description: string | null;
  badgeId: string;
  initAmount: Decimal | number;
  limit: Decimal | number;
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
