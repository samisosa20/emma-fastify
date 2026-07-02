import { Prisma } from "@prisma/client";

export type Heritage = {
  id: string;
  name: string;
  comercialAmount: Prisma.Decimal | number;
  legalAmount: Prisma.Decimal | number;
  badgeId: string;
  year: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type HeritageReport = {
  year: number | null;
  userId: string;
  balances: {
    code: string | null;
    flag: string | null;
    symbol: string | null;
    amount: Prisma.Decimal | number;
  }[];
};

export type ParamsHeritage = {
  year?: number;
  userId?: string;
};

export type CreateHeritage = Omit<Heritage, "id" | "createdAt" | "updatedAt">;
