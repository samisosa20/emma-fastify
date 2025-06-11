import { Prisma } from "@prisma/client";
import { z } from "zod";

export const MovementCreateInput = z.object({
  description: z
    .string({ message: "description is required" })
    .min(1)
    .max(255)
    .nullable()
    .optional(),
  amount: z.number({ message: "amount is required" }),
  datePurchase: z
    .string({ message: "date is required" })
    .datetime({ message: "Invalid date format" }),
  categoryId: z.string({ message: "categoryId is required" }).uuid(),
  accountId: z.string({ message: "accountId is required" }).uuid(),
  transferId: z.string().uuid().nullable().optional(),
  eventId: z.string().uuid().nullable().optional(),
  investmentId: z.string().uuid().nullable().optional(),
  // userId: z.string({ message: "userId is required" }).uuid(),
  addWithdrawal: z.boolean({ message: "addWithdrawal is required" }),
}) satisfies z.Schema<Omit<Prisma.MovementUncheckedCreateInput, "userId">>;

export const MovementUpdateInput = MovementCreateInput.partial();

export type MovementCreateInputType = z.infer<typeof MovementCreateInput>;
export type MovementUpdateInputType = z.infer<typeof MovementUpdateInput>;
