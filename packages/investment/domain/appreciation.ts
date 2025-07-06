import { Decimal } from "@prisma/client/runtime/library";

export type Appreciation = {
  id: string;
  dateAppreciation: Date;
  amount: Decimal | number;
  investmentId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAppreciation = Omit<
  Appreciation,
  "id" | "createdAt" | "updatedAt"
>;
