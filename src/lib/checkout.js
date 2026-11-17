import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const createCheckout = createServerFn({ method: "POST" })
  .validator(z.object({ productId: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    const { default: Stripe } = await import("stripe");
    const { db } = await import("./db.server.js");
    const { products, purchases } = await import("../db/schema.js");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const [product] = await db.select().from(products).where(eq(products.id, data.productId));
    if (!product || !product.active) throw new Error("Product not found");
    if (!Number.isInteger(product.priceCents) || product.priceCents < 50) throw new Error("Invalid price");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: product.priceCents,
          product_data: { name: product.name },
        },
      }],
      success_url: `${process.env.APP_URL}/thank-you?checkout_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/shop`,
    });

    await db.insert(purchases).values({
      checkoutId: session.id,
      productId: product.id,
      productName: product.name,
      amountCents: product.priceCents,
      currency: product.currency,
    });
    return { redirectUrl: session.url, checkoutId: session.id };
  });
