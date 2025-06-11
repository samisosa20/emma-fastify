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

export type CreateHeritage = Omit<Heritage, "id" | "createdAt" | "updatedAt">;
