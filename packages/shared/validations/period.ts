import { Prisma } from "@prisma/client";
import { z } from "zod";

export const PeriodCreateInput = z.object({
  name: z
    .string("El nombre es requerido")
    .min(1, "El nombre no puede estar vacío")
    .max(100),
}) satisfies z.Schema<
  Omit<Prisma.PeriodUncheckedCreateInput, "id" | "createdAt" | "updatedAt">
>; // Asegúrate que PeriodUncheckedCreateInput exista y los campos omitidos sean correctos

export const PeriodUpdateInput = PeriodCreateInput.partial();

export type PeriodCreateInputType = z.infer<typeof PeriodCreateInput>;
export type PeriodUpdateInputType = z.infer<typeof PeriodUpdateInput>;
