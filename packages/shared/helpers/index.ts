import bcrypt from "bcryptjs";

import { transporterMailer } from "../mailer";
import { ZodError } from "zod";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}

export function handleShowDeleteData(show?: boolean) {
  const orConditions: any[] = [{ deletedAt: null }];
  if (show) {
    orConditions.push({ deletedAt: { not: null } });
  }
  return orConditions;
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporterMailer.sendMail({
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function sendEmailConfirmation(email: string, token: string) {
  // Create a confirmation URL
  const confirmationUrl = `${process.env.APP_URL}/confirm-email?token=${token}&email=${email}`;
  // Send the confirmation email
  await sendEmail(
    email,
    "Confirm your email address",
    `<p>Hi,</p>
    <p>Please confirm your email address by clicking the link below:</p>
   <a href="${confirmationUrl}">Confirm Email</a>
   <p>If you did not request this, please ignore this email.</p>`
  );
}

export const formatErrorMessageMiddleware = (error: any) => {
  if (error instanceof ZodError) {
    throw Object.assign(new Error("Validation Error", { cause: "zod" }), {
      statusCode: 400,
      message: error.issues.map((e) => e.message),
      error: "Validation Error",
    });
  }
};
