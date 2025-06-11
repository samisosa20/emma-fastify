import { Prisma } from "@prisma/client";
import { z } from "zod";

export const InvestmentCreateInput = z.object({
  name: z.string({ message: "name is required" }).min(1).max(255),
  initAmount: z.number({ message: "initAmount is required" }),
  endAmount: z.number({ message: "endAmount is required" }),
  type: z.string({ message: "type is required" }).min(1).max(100),
  badgeId: z.string({ message: "badgeId is required" }).uuid(),
  dateInvestment: z
    .string({ message: "investmentDate is required" })
    .datetime({ message: "Invalid date format" }), // o z.date()
  // userId: z.string({ message: "userId is required" }),
  // categoryId: z.string().optional().nullable(), // Si aplica
}) satisfies z.Schema<Omit<Prisma.InvestmentUncheckedCreateInput, "userId">>;

export const InvestmentUpdateInput = InvestmentCreateInput.partial();

export type InvestmentCreateInputType = z.infer<typeof InvestmentCreateInput>;
export type InvestmentUpdateInputType = z.infer<typeof InvestmentUpdateInput>;
