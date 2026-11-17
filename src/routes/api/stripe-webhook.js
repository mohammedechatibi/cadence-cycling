import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { default: Stripe } = await import("stripe");
        const { eq } = await import("drizzle-orm");
        const { db } = await import("../../lib/db.server.js");
        const { purchases } = await import("../../db/schema.js");
        const { markPaidAndDeliver } = await import("../../lib/purchases.server.js");

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const body = await request.text();
        let event;
        try {
          event = stripe.webhooks.constructEvent(
            body, request.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET);
        } catch {
          return new Response("Bad signature", { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          if (session.payment_status === "paid") {
            const [record] = await db.select().from(purchases).where(eq(purchases.checkoutId, session.id));
            if (record) await markPaidAndDeliver(record, session.customer_details?.email || "");
          }
        }
        return new Response("ok");
      },
    },
  },
});
