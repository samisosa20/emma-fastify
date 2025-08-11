import { Prisma } from "@prisma/client";
import { z } from "zod";

export const EventCreateInput = z.object({
  name: z.string({ message: "name is required" }).min(1).max(255),
  endEvent: z.string({ message: "endEvent is required" }),
  // userId: z.string({ message: "userId is required" }), // Mantenido comentado si userId se maneja server-side
  // Otros campos relevantes como type, categoryId si aplican
}) satisfies z.Schema<Omit<Prisma.EventUncheckedCreateInput, "userId">>;

export const EventUpdateInput = EventCreateInput.partial();

export type EventCreateInputType = z.infer<typeof EventCreateInput>;
export type EventUpdateInputType = z.infer<typeof EventUpdateInput>;
