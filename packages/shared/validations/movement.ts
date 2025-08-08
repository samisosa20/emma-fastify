import { Prisma } from "@prisma/client";
import { z } from "zod";

export const MovementCreateInput = z.object({
  description: z
    .string({ message: "description is required" })
    .max(255)
    .nullable()
    .optional(),
  amount: z.number({ message: "amount is required" }),
  datePurchase: z.iso.datetime({ message: "Invalid date format" }),
  categoryId: z.string({ message: "categoryId is required" }),
  accountId: z.uuid({ message: "accountId is required" }),
  transferId: z.union([z.uuid(), z.null()]).optional(),
  eventId: z.union([z.uuid(), z.null()]).optional(),
  investmentId: z.union([z.uuid(), z.null()]).optional(),
  type: z.enum(["move", "transfer"]),
  amountEnd: z.number().nullable().optional(),
  accountEndId: z.union([z.uuid(), z.null()]).optional(),
  // userId: z.string({ message: "userId is required" }).uuid(),
  addWithdrawal: z.boolean({ message: "addWithdrawal is required" }),
}) satisfies z.Schema<Omit<Prisma.MovementUncheckedCreateInput, "userId">>;

export const MovementUpdateInput = MovementCreateInput.partial();

export type MovementCreateInputType = z.infer<typeof MovementCreateInput>;
export type MovementUpdateInputType = z.infer<typeof MovementUpdateInput>;
