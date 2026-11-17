import { and, eq, ne } from "drizzle-orm";
import nodemailer from "nodemailer";
import { db } from "./db.server.js";
import { purchases } from "../db/schema.js";
import { renderEmail } from "./email.server.js";

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

const from = () => process.env.MAIL_FROM ?? "Cadence <no-reply@localhost>";

export function formatAmount(cents, currency) {
  return `${(Number(cents || 0) / 100).toFixed(2)} ${currency || "EUR"}`;
}

export async function markPaidAndDeliver(record, buyerEmail) {
  const res = db.update(purchases)
    .set({ status: "paid", paidAt: new Date().toISOString(), buyerEmail })
    .where(and(eq(purchases.id, record.id), ne(purchases.status, "paid")))
    .run();
  if (res.changes === 0) return null;

  const productName = record.productName || "Your Cadence plan";
  const amount = formatAmount(record.amountCents, record.currency);
  const errors = [];

  if (buyerEmail) {
    try {
      await mailer.sendMail({
        from: from(),
        to: buyerEmail,
        subject: "Your Cadence plan is confirmed",
        html: renderEmail("PlanDelivery", { product_name: productName, amount, order_id: record.checkoutId }),
      });
    } catch (e) { errors.push(e?.message ?? "Plan delivery email failed"); }
  } else {
    errors.push("No buyer email returned by Stripe");
  }

  if (process.env.ADMIN_EMAIL) {
    try {
      await mailer.sendMail({
        from: from(),
        to: process.env.ADMIN_EMAIL,
        subject: `New sale: ${productName}`,
        html: renderEmail("NewSale", {
          product_name: productName, amount, buyer_email: buyerEmail || "unknown",
          sale_time: new Date().toLocaleString("en-GB", { timeZone: "Europe/Berlin" }),
          order_id: record.checkoutId,
        }),
      });
    } catch (e) { errors.push(e?.message ?? "Sales notification failed"); }
  }
  return errors.length ? errors.join("; ") : null;
}
