import { Prisma } from "@prisma/client";
import { z } from "zod";

export const PhoneCodeCreateInput = z.object({
  code: z.number({ message: "code is required" }), // O z.string() si el código puede tener '+' o ser tratado como string
  country: z.string({ message: "country is required" }).min(1).max(100),
}) satisfies z.Schema<Prisma.PhoneCodeUncheckedCreateInput>;

export const PhoneCodeUpdateInput = PhoneCodeCreateInput.partial();

export type PhoneCodeCreateInputType = z.infer<typeof PhoneCodeCreateInput>;
export type PhoneCodeUpdateInputType = z.infer<typeof PhoneCodeUpdateInput>;
