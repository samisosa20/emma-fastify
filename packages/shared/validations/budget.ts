import { Prisma } from "@prisma/client";
import { z } from "zod";

export const BudgetCreateInput = z.object({
  amount: z.number({ message: "amount is required" }),
  year: z.number({ message: "year is required" }).min(2000),
  categoryId: z.uuid({ message: "categoryId is required" }),
  badgeId: z.uuid({ message: "categoryId is required" }),
  periodId: z.uuid({ message: "categoryId is required" }),
}) satisfies z.Schema<Omit<Prisma.BudgetUncheckedCreateInput, "userId">>;

export const BudgetUpdateInput = BudgetCreateInput.partial();

export type BudgetCreateInputType = z.infer<typeof BudgetCreateInput>;
export type BudgetUpdateInputType = z.infer<typeof BudgetUpdateInput>;
