import { Decimal } from "@prisma/client/runtime/library";

export type Heritage = {
  id: string;
  name: string;
  comercialAmount: Decimal | number;
  legalAmount: Decimal | number;
  badgeId: string;
  year: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type HeritageReport = {
  year: number | null;
  code: string | null;
  flag: string | null;
  symbol: string | null;
  amount: Decimal | number;
  userId: string;
};

export type ParamsHeritage = {
  year?: number;
  userId?: string;
};

export type CreateHeritage = Omit<Heritage, "id" | "createdAt" | "updatedAt">;
