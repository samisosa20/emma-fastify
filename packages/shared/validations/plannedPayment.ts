import { Prisma } from "@prisma/client";
import { z } from "zod";

export const PlannedPaymentCreateInput = z.object({
  description: z.string().nullable().optional(),
  amount: z.number({ message: "amount is required" }),
  startDate: z
    .string({ message: "startDate is required" })
    .datetime({ message: "Invalid date format" }),
  endDate: z
    .string()
    .datetime({ message: "Invalid date format" })
    .nullable()
    .optional(),
  specificDay: z
    .number({ message: "specificDay is required" })
    .int()
    .min(1)
    .max(31),
  categoryId: z.string({ message: "categoryId is required" }).uuid(),
  accountId: z.string({ message: "accountId is required" }).uuid(),
}) satisfies z.Schema<
  Omit<Prisma.PlannedPaymentUncheckedCreateInput, "userId">
>;

export const PlannedPaymentUpdateInput = PlannedPaymentCreateInput.partial();

export type PlannedPaymentCreateInputType = z.infer<
  typeof PlannedPaymentCreateInput
>;
export type PlannedPaymentUpdateInputType = z.infer<
  typeof PlannedPaymentUpdateInput
>;
