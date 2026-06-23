import { Prisma } from "@prisma/client";
import { z } from "zod";

export const InvestmentCreateInput = z.object({
  name: z.string({ message: "name is required" }).min(1).max(255),
  initAmount: z.number({ message: "initAmount is required" }),
  endAmount: z.number({ message: "endAmount is required" }),
  badgeId: z.uuid({ message: "badgeId is required" }),
  dateInvestment: z.string({ message: "dateInvestment is required" }),
  // userId: z.string({ message: "userId is required" }),
  // categoryId: z.string().optional().nullable(), // Si aplica
}) satisfies z.Schema<Omit<Prisma.InvestmentUncheckedCreateInput, "userId">>;

export const AppreciationCreateInput = z.object({
  amount: z.number({ message: "amount is required" }),
  dateAppreciation: z.string({ message: "dateAppreciation is required" }),
}) satisfies z.Schema<
  Omit<Prisma.InvestmentAppreciationCreateInput, "user" | "investment">
>;

export const InvestmentUpdateInput = InvestmentCreateInput.partial();
export const AppreciationUpdateInput = AppreciationCreateInput.partial();

export const InvestmentIdParams = z.object({
  id: z.string().uuid({ message: "Invalid investment ID format" }),
});

export const AppreciationIdParams = z.object({
  id: z.string().uuid({ message: "Invalid investment ID format" }),
  appreciationId: z.string().uuid({ message: "Invalid appreciation ID format" }),
});

export type InvestmentCreateInputType = z.infer<typeof InvestmentCreateInput>;
export type InvestmentUpdateInputType = z.infer<typeof InvestmentUpdateInput>;

export type AppreciationCreateInputType = z.infer<
  typeof AppreciationCreateInput
>;
export type AppreciationUpdateInputType = z.infer<
  typeof AppreciationUpdateInput
>;
