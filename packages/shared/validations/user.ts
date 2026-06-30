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
  .max(100)
  .regex(passwordRegex, {
    message:
      "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).",
  });

export const UserCreateInput = z.object({
  name: z.string({ message: "name is required" }).max(100),
  email: z
    .string({ message: "email is required" })
    .email("Invalid email")
    .max(255),
  phone: z
    .string({ message: "phone is required" })
    .max(20)
    .regex(phoneRegex, "Invalid Phone!")
    .optional()
    .nullable(),
  phoneCode: z.string().max(10).optional().nullable(),
  password: strongPasswordSchema,
  badgeId: z.string({ message: "badgeId is required" }).uuid(),
}) satisfies z.Schema<Omit<Prisma.UserUncheckedCreateInput, "deletedAt">>;

export const UserLoginInput = z.object({
  email: z
    .string({ message: "email is required" })
    .email("Invalid email")
    .max(255),
  password: z.string({ message: "password is required" }).max(100),
});

export const UserConfirmEmailInput = z.object({
  email: z
    .string({ message: "email is required" })
    .email("Invalid email")
    .max(255),
  token: z.string({ message: "token is required" }).uuid("Invalid token format"),
});

export const UserResendEmailInput = z.object({
  email: z
    .string({ message: "email is required" })
    .email("Invalid email")
    .max(255),
});

export const UserRecoveryPasswordInput = z.object({
  email: z
    .string({ message: "email is required" })
    .email("Invalid email")
    .max(255),
});
