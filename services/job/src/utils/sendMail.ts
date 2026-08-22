import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter: Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error("SMTP_USER or SMTP_PASS is missing");
  }

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });

  return transporter;
};

export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `nextHire <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
