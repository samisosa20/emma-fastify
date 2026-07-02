import { Prisma } from "@prisma/client";

export type Movement = {
  id: string;
  accountId: string;
  categoryId: string;
  description: string | null;
  amount: Prisma.Decimal | number;
  trm: Prisma.Decimal;
  datePurchase: Date;
  transferId: string | null;
  eventId: string | null;
  investmentId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  addWithdrawal: boolean;
};

export type TranferMovement = {
  transferOut:
    | {
        id: string;
        account: {
          id: string;
          name: string;
          badgeId: string;
        };
        amount: Prisma.Decimal | number;
      }
    | {};
  transferIn:
    | {
        id: string;
        account: {
          id: string;
          name: string;
          badgeId: string;
        };
        amount: Prisma.Decimal | number;
      }
    | {};
};

export type CreateMovement = Omit<
  Movement,
  "id" | "createdAt" | "updatedAt" | "trm" | "transferId" | "transferOut"
> & {
  type: "move" | "transfer";
  amountEnd?: string;
  accountEndId?: string;
};

export type MovementsParams = {
  accountId?: string;
  badgeId?: string;
  description?: string;
  amount?: string;
  eventId?: string;
  categoryId?: string;
  category?: string;
  investmentId?: string;
  datePurchase?: string;
  userId?: string;
  year?: number;
  weekNumber?: number;
  month?: number;
  day?: number;
};
