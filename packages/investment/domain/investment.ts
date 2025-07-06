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

export type ExtraInfoInvestment = {
  totalReturns: number;
  totalWithdrawal: number;
  valorization: string;
  totalRate: string;
};

export type InvestmentAppreciation = {
  id: string;
  dateAppreciation: Date;
  amount: Decimal | number;
  investmentId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateInvestment = Omit<
  Investment,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type CreateInvestmentAppreciation = Omit<
  InvestmentAppreciation,
  "id" | "createdAt" | "updatedAt"
>;
