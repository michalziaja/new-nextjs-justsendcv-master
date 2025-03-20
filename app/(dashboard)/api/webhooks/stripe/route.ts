//api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Brak podpisu Stripe w żądaniu webhook");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Błąd weryfikacji podpisu webhook:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    // Obsługa zdarzeń anulowania i aktualizacji subskrypcji
    if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
      let subscription: Stripe.Subscription | null = null; // Inicjalizacja z null
      let userId: string | undefined;

      if (event.type === "customer.subscription.deleted") {
        subscription = event.data.object as Stripe.Subscription;
        userId = subscription.metadata?.userId;
      } else if (event.type === "customer.subscription.updated") {
        subscription = event.data.object as Stripe.Subscription;
        userId = subscription.metadata?.userId;

        // Sprawdź, czy subskrypcja jest ustawiona na anulowanie na koniec okresu lub jest przywracana
        if (subscription.cancel_at_period_end) {
          console.log("Subskrypcja ustawiona na anulowanie na koniec okresu:", subscription.id);
        } else if (subscription.status === "active") {
          console.log("Subskrypcja przywrócona do stanu aktywnego:", subscription.id);
        } else {
          console.warn("Subskrypcja nie wymaga aktualizacji, pomijanie:", subscription.id);
          return NextResponse.json({ received: true, status: "skipped_no_update_needed" }, { status: 200 });
        }
      }

      if (!subscription || !userId) {
        console.error("Brak subskrypcji lub userId w metadanych – wymagane");
        return NextResponse.json(
          { error: "Missing subscription or userId in metadata" },
          { status: 400 }
        );
      }

      // Pobierz aktualną subskrypcję
      const { data: existingSubscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("stripe_subscription_id, status, plan, end_date")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Błąd pobierania subskrypcji:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch subscription", details: fetchError.message },
          { status: 500 }
        );
      }

      if (!existingSubscription) {
        console.warn("Nie znaleziono subskrypcji dla użytkownika:", userId);
        return NextResponse.json({ received: true, status: "subscription_not_found" }, { status: 200 });
      }

      // Zaktualizuj status w zależności od sytuacji
      let newStatus: string;
      if (subscription.cancel_at_period_end || event.type === "customer.subscription.deleted") {
        newStatus = "pending_cancellation";
        console.log("Zmiana statusu na 'pending_cancellation' dla użytkownika:", userId);
      } else if (!subscription.cancel_at_period_end && subscription.status === "active") {
        newStatus = "active";
        console.log("Zmiana statusu na 'active' dla użytkownika:", userId);
      } else {
        console.warn("Brak konieczności aktualizacji statusu, pomijanie:", userId);
        return NextResponse.json({ received: true, status: "skipped_no_status_change" }, { status: 200 });
      }

      // Aktualizacja subskrypcji w bazie danych
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Błąd aktualizacji subskrypcji:", error);
        return NextResponse.json(
          { error: "Failed to update subscription", details: error.message },
          { status: 500 }
        );
      }

      // Powiadomienie o zmianie statusu
      const notificationMessage = newStatus === "pending_cancellation"
        ? "Subskrypcja Premium została anulowana, ale pozostaje aktywna do końca okresu."
        : "Subskrypcja Premium została przywrócona do stanu aktywnego.";
      await supabase.rpc("notify_subscribers", {
        p_user_id: userId,
        p_notification_type: newStatus === "pending_cancellation" ? "subscription_cancelled" : "subscription_restored",
        p_message: notificationMessage,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas przetwarzania webhooka:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}