import { Prisma } from "@prisma/client";
import { z } from "zod";

export const BadgeCreateInput = z.object({
  name: z
    .string({ message: "name is required" })
    .min(1, "name cannot be empty")
    .max(100),
  // userId: z.string({ message: "userId is required" }), // Si Badge está asociado a un User y se pasa en el body
}) satisfies z.Schema<Omit<Prisma.BadgeUncheckedCreateInput, "userId">>; // Ajusta Omit según los campos que realmente vengan del body

export const BadgeUpdateInput = BadgeCreateInput.partial();

export type BadgeCreateInputType = z.infer<typeof BadgeCreateInput>;
export type BadgeUpdateInputType = z.infer<typeof BadgeUpdateInput>;
