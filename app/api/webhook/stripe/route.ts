import { headers } from "next/headers";

import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

type SessionMetadata = {
  enrollmentId?: string;
  courseId?: string;
  userId?: string;
};

function getSessionMetadata(session: Stripe.Checkout.Session): SessionMetadata {
  return {
    enrollmentId: session.metadata?.enrollmentId,
    courseId: session.metadata?.courseId,
    userId: session.metadata?.userId,
  };
}

function customerIdOf(session: Stripe.Checkout.Session): string | null {
  if (typeof session.customer === "string") return session.customer;
  return session.customer?.id ?? null;
}

/**
 * Loads the enrollment referenced by a Checkout Session and verifies it belongs
 * to the same user and course recorded in the session metadata.
 */
async function resolveEnrollment(session: Stripe.Checkout.Session) {
  const { enrollmentId, courseId, userId } = getSessionMetadata(session);
  if (!enrollmentId || !courseId || !userId) return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, userId: true, courseId: true, status: true },
  });
  if (!enrollment) return null;
  if (enrollment.userId !== userId || enrollment.courseId !== courseId) {
    return null;
  }

  const customerId = customerIdOf(session);
  if (customerId) {
    const customerUser = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });
    if (customerUser && customerUser.id !== userId) return null;
  }

  return enrollment;
}

async function setEnrollmentStatus(
  enrollmentId: string,
  status: "Active" | "Cancelled",
  amount?: number | null,
) {
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status,
      ...(amount != null ? { amount } : {}),
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Async payment methods complete the session before the funds settle. Only
  // activate once Stripe reports the payment as paid; otherwise wait for the
  // async_payment_succeeded event.
  if (session.payment_status !== "paid") return;

  const enrollment = await resolveEnrollment(session);
  if (!enrollment) {
    console.error(
      "checkout.session.completed: enrollment/metadata mismatch",
      session.id,
    );
    return;
  }

  await setEnrollmentStatus(enrollment.id, "Active", session.amount_total);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const enrollment = await resolveEnrollment(session);
  if (!enrollment) return;
  if (enrollment.status !== "Pending") return;

  await setEnrollmentStatus(enrollment.id, "Cancelled");
}

async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session) {
  const enrollment = await resolveEnrollment(session);
  if (!enrollment) return;
  if (enrollment.status === "Active") return;

  await setEnrollmentStatus(enrollment.id, "Cancelled");
}

async function findEnrollmentByPaymentIntent(paymentIntentId: string) {
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });
  const session = sessions.data[0];
  if (!session) return null;
  return resolveEnrollment(session);
}

async function cancelEnrollmentForPaymentIntent(paymentIntentId: string) {
  const enrollment = await findEnrollmentByPaymentIntent(paymentIntentId);
  if (!enrollment) return;
  if (enrollment.status === "Cancelled") return;

  await setEnrollmentStatus(enrollment.id, "Cancelled");
}

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();

  const signature = headersList.get("Stripe-Signature");

  if (!signature) return new Response("Webhook error", { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Webhook error", { status: 400 });
  }

  // Idempotency guard: replays of an already-processed event are no-ops.
  const alreadyProcessed = await prisma.processedWebhookEvent.findUnique({
    where: { id: event.id },
  });
  if (alreadyProcessed) {
    return new Response(null, { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "checkout.session.async_payment_failed":
        await handleAsyncPaymentFailed(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.payment_failed":
        // Checkout sessions stay open after a failed attempt, so the enrollment
        // remains Pending and the learner can retry. Nothing to do here.
        break;
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (paymentIntentId) {
          await cancelEnrollmentForPaymentIntent(paymentIntentId);
        }
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const paymentIntentId =
          typeof dispute.payment_intent === "string"
            ? dispute.payment_intent
            : dispute.payment_intent?.id;
        if (paymentIntentId) {
          await cancelEnrollmentForPaymentIntent(paymentIntentId);
        }
        break;
      }
      default:
        // Unhandled event types are acknowledged and recorded so Stripe stops
        // retrying them.
        break;
    }
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    // Return 500 so Stripe retries. The idempotency row is only written after a
    // successful handler, so the retry re-attempts the work.
    return new Response("Webhook processing error", { status: 500 });
  }

  await prisma.processedWebhookEvent.upsert({
    where: { id: event.id },
    create: { id: event.id, type: event.type },
    update: {},
  });

  return new Response(null, { status: 200 });
}
