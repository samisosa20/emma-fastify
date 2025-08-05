import { Prisma } from "@prisma/client";
import { z } from "zod";

export const CategoryCreateInput = z.object({
  name: z.string({ message: "name is required" }).min(1).max(100),
  description: z.string({ message: "description is required" }),
  groupId: z.uuid({ message: "groupId is required" }),
  color: z.string({ message: "color is required" }).min(4).max(10),
  icon: z.string({ message: "icon is required" }).min(1).max(100),
  //userId: z.string({ message: "userId is required" }).uuid(),
}) satisfies z.Schema<Omit<Prisma.CategoryUncheckedCreateInput, "userId">>;

export const CategoryUpdateInput = CategoryCreateInput.partial();

export type CategoryCreateInputType = z.infer<typeof CategoryCreateInput>;
export type CategoryUpdateInputType = z.infer<typeof CategoryUpdateInput>;
