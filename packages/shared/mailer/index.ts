import nodemailer from "nodemailer";

const mailPort = Number(process.env.MAIL_PORT) || 465;

export const transporterMailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "",
  port: mailPort,
  secure: mailPort === 465,
  auth: {
    user: process.env.MAIL_USERNAME || "",
    pass: process.env.MAIL_PASSWORD || "",
  },
});
