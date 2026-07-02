import { Prisma } from "@prisma/client";

export type Appreciation = {
  id: string;
  dateAppreciation: Date;
  amount: Prisma.Decimal | number;
  investmentId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAppreciation = Omit<
  Appreciation,
  "id" | "createdAt" | "updatedAt"
>;
