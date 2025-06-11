import { Prisma } from "@prisma/client";
import { z } from "zod";

export const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);
export const passwordRegex = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
);

export const strongPasswordSchema = z
  .string({ message: "password is required" })
  .regex(passwordRegex, {
    message:
      "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).",
  });

export const UserCreateInput = z.object({
  name: z.string({ message: "name is required" }).max(100),
  email: z.string({ message: "email is required" }).email("Invalid email"),
  phone: z
    .string({ message: "phone is required" })
    .regex(phoneRegex, "Invalid Phone!")
    .optional()
    .nullable(),
  phoneCode: z.string().optional().nullable(),
  password: z.string({ message: "password is required" }),
  deletedAt: z.date().nullable().optional(),
}) satisfies z.Schema<Prisma.UserUncheckedCreateInput>;
