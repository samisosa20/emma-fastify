import { Prisma } from "@prisma/client";
import { z } from "zod";

export const GroupCategoryCreateInput = z.object({
  name: z
    .string("El nombre es requerido")
    .min(1, "El nombre no puede estar vacío")
    .max(100),
}) satisfies z.Schema<
  Omit<
    Prisma.GroupCategoryUncheckedCreateInput,
    "id" | "createdAt" | "updatedAt"
  >
>; // Asegúrate que GroupCategoryUncheckedCreateInput exista

export const GroupCategoryUpdateInput = GroupCategoryCreateInput.partial();

export type GroupCategoryCreateInputType = z.infer<
  typeof GroupCategoryCreateInput
>;
export type GroupCategoryUpdateInputType = z.infer<
  typeof GroupCategoryUpdateInput
>;
