import { Decimal } from "@prisma/client/runtime/library";

export type Report = {
  category: string;
  amount: number | Decimal;
}[];

export type ReportParams = {
  weekNumber?: number;
  year?: number;
  badgeId: string;
  userId: string;
  date?: string;
  month?: number;
};
