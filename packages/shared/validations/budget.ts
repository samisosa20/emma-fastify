import { Prisma } from "@prisma/client";
import { z } from "zod";

export const BudgetCreateInput = z.object({
  name: z.string({ message: "name is required" }).min(1).max(255),
  amount: z.number({ message: "amount is required" }),
  year: z.number({ message: "year is required" }).min(2000),
  categoryId: z.string({ message: "categoryId is required" }).uuid(),
  badgeId: z.string({ message: "categoryId is required" }).uuid(),
  periodId: z.string({ message: "categoryId is required" }).uuid(),
  //userId: z.string({ message: "userId is required" }),
}) satisfies z.Schema<Omit<Prisma.BudgetUncheckedCreateInput, "userId">>;

export const BudgetUpdateInput = BudgetCreateInput.partial();

export type BudgetCreateInputType = z.infer<typeof BudgetCreateInput>;
export type BudgetUpdateInputType = z.infer<typeof BudgetUpdateInput>;
