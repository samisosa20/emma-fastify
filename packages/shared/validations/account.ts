import { Prisma } from "@prisma/client";
import { z } from "zod";

export const AccountCreateInput = z.object({
  name: z.string({ message: "name is required" }).min(1).max(100),
  description: z
    .string({ message: "description is required" })
    .nullable()
    .optional(),
  badgeId: z.string({ message: "badgeId is required" }).uuid(),
  initAmount: z.number({ message: "initAmount is required" }),
  limit: z.number({ message: "limit is required" }),
  typeId: z.string({ message: "typeId is required" }).uuid(),
  // userId: z.string({ message: "userId is required" }),
}) satisfies z.Schema<Omit<Prisma.AccountUncheckedCreateInput, "userId">>;

export const AccountUpdateInput = AccountCreateInput.partial();

export type AccountCreateInputType = z.infer<typeof AccountCreateInput>;
export type AccountUpdateInputType = z.infer<typeof AccountUpdateInput>;
