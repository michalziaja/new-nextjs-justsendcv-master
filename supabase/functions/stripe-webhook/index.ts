// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import Stripe from "npm:stripe@16.4.0";

// Inicjalizacja Stripe i Supabase (globalne zmienne)
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const stripe = new Stripe(STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" });
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// Funkcja weryfikująca webhook
async function verifyWebhook(req: Request): Promise<any> {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("No Stripe signature found in request");
    throw new Error("No signature");
  }

  const body = await req.text();
  if (!body) {
    console.error("Empty request body");
    throw new Error("Empty request body");
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET!);
    console.log(`Webhook event received: ${event.type}`);
    return event;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Webhook verification failed: ${errorMessage}`);
  }
}

// Funkcja aktualizująca subskrypcję w bazie danych
async function updateSubscription(userId: string, updates: Record<string, any>): Promise<void> {
  const { data: existingSubscription, error: checkError } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("user_id", userId)
    .single();

  if (checkError || !existingSubscription) {
    console.error("No subscription found to update:", checkError || "Record not found");
    throw new Error(checkError?.message || "No matching subscription found");
  }

  const { data, error } = await supabase
      .from("subscriptions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  console.log(`Updated subscription for user: ${userId}`, data);
}

// Funkcja wysyłająca powiadomienia do tabeli notifications
async function sendNotification(userId: string, type: string, message: string, subscriptionId: string): Promise<void> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type: type,
      message: `${message} (Subscription ID: ${subscriptionId})`,
      read: false,
      created_at: new Date().toISOString(),
      expires_at: null, // Możesz ustawić datę wygaśnięcia, jeśli chcesz
    })
    .select()
    .single();

    if (error) {
    console.error("Error inserting notification:", error);
    throw new Error(`Failed to send notification: ${error.message}`);
  }

  console.log(`Notification sent for ${type}:`, data);
}

// Obsługa invoice.payment_failed
async function handlePaymentFailed(event: any): Promise<void> {
  const invoice = event.data.object;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    console.error("Missing subscriptionId in invoice");
    throw new Error("Missing subscriptionId in invoice");
  }

  console.log(`Processing failed payment for subscription: ${subscriptionId}`);

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = stripeSubscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    throw new Error("Missing userId in subscription metadata");
  }

  await updateSubscription(userId, { status: "payment_pending" });
  await sendNotification(
    userId,
    "payment_failed",
    "Your Premium subscription payment failed.",
    subscriptionId
  );

  console.log(`Successfully processed failed payment for subscription: ${subscriptionId}`);
}

// Obsługa invoice.payment_succeeded
async function handlePaymentSucceeded(event: any): Promise<void> {
  const invoice = event.data.object;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    console.error("Missing subscriptionId in invoice");
    throw new Error("Missing subscriptionId in invoice");
  }

  console.log(`Processing successful payment for subscription: ${subscriptionId}`);

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = stripeSubscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    throw new Error("Missing userId in subscription metadata");
  }

  const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

  await updateSubscription(userId, {
    status: "active",
    end_date: periodEnd.toISOString(),
  });
  await sendNotification(
    userId,
    "payment_succeeded",
    "Your Premium subscription payment succeeded.",
    subscriptionId
  );

  console.log(`Successfully processed successful payment for subscription: ${subscriptionId}`);
}

// Obsługa customer.subscription.deleted
async function handleSubscriptionDeleted(event: any): Promise<void> {
  const subscription = event.data.object;
  const subscriptionId = subscription.id;
  const userId = subscription.metadata?.userId;

  if (!subscriptionId) {
    console.error("Missing subscriptionId in event");
    throw new Error("Missing subscriptionId in event");
  }

  console.log(`Processing subscription cancellation: ${subscriptionId}`);

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    throw new Error("Missing userId in subscription metadata");
  }

  await updateSubscription(userId, { status: "pending_cancellation" });
  await sendNotification(
    userId,
    "subscription_expired",
    "Your Premium subscription has expired and switched to Free.",
    subscriptionId
  );

  console.log(`Successfully processed cancellation for subscription: ${subscriptionId}`);
}

// Główna funkcja serve
serve(async (req: Request) => {
  // Sprawdź zmienne środowiskowe na starcie
  if (!STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
    console.error("Missing environment variables at startup");
    return new Response(JSON.stringify({ error: "Missing environment variables" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const event = await verifyWebhook(req);

    switch (event.type) {
      case "invoice.payment_failed":
        await handlePaymentFailed(event);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
      default:
        console.warn("Unhandled Stripe event:", event.type);
        return new Response(JSON.stringify({ received: true, status: "ignored" }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("No signature") || errorMessage.includes("Empty request body") || errorMessage.includes("Missing") ? 400 : 500;
    return new Response(
      JSON.stringify({ error: "Webhook processing failed", details: errorMessage }),
      { status: statusCode, headers: { "Content-Type": "application/json" } }
    );
  }
});