import { Prisma } from "@prisma/client";
import { z } from "zod";

export const AccountTypeCreateInput = z.object({
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre no puede estar vacío")
    .max(100),
}) satisfies z.Schema<
  Omit<Prisma.AccountTypeUncheckedCreateInput, "id" | "createdAt" | "updatedAt">
>; // Asegúrate que AccountTypeUncheckedCreateInput exista

export const AccountTypeUpdateInput = AccountTypeCreateInput.partial();

export type AccountTypeCreateInputType = z.infer<typeof AccountTypeCreateInput>;
export type AccountTypeUpdateInputType = z.infer<typeof AccountTypeUpdateInput>;
