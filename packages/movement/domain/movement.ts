import { Decimal } from "@prisma/client/runtime/library";

export type Movement = {
  id: string;
  accountId: string;
  categoryId: string;
  description: string | null;
  amount: Decimal | number;
  trm: Decimal;
  datePurchase: Date;
  transferId: string | null;
  eventId: string | null;
  investmentId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  addWithdrawal: boolean;
};

export type CreateMovement = Omit<
  Movement,
  "id" | "createdAt" | "updatedAt" | "trm"
> & {
  type: "move" | "transfer";
};

export type MovementsParams = {
  accountId?: string;
  description?: string;
  amount?: string;
  eventId?: string;
  category?: string;
  investmentId?: string;
  datePurchase?: string;
};
