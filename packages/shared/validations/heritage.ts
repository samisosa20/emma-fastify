import { Prisma } from "@prisma/client";
import { z } from "zod";

export const HeritageCreateInput = z.object({
  name: z.string({ message: "name is required" }).min(1).max(255),
  comercialAmount: z.number({ message: "comercialAmount is required" }),
  legalAmount: z.number({ message: "legalAmount is required" }),
  badgeId: z.string({ message: "badgeId is required" }),
  year: z.number({ message: "year is required" }).int(),
  userId: z.string({ message: "userId is required" }),
}) satisfies z.Schema<Prisma.HeritageUncheckedCreateInput>;

export const HeritageUpdateInput = HeritageCreateInput.partial();

export type HeritageCreateInputType = z.infer<typeof HeritageCreateInput>;
export type HeritageUpdateInputType = z.infer<typeof HeritageUpdateInput>;
