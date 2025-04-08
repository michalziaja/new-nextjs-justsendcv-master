//api/verify-payment/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(request: Request) {
  try {
    // Pobierz ID sesji z parametrów URL
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Nie podano identyfikatora sesji" },
        { status: 400 }
      );
    }

    // Uzyskaj sesję użytkownika z Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Brak autoryzowanego użytkownika:", authError?.message);
      return NextResponse.json({ error: "Nieautoryzowany użytkownik" }, { status: 401 });
    }

    // Pobierz sesję płatności ze Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    // Sprawdź, czy płatność została zakończona pomyślnie
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Płatność nie została zakończona" },
        { status: 400 }
      );
    }

    // Sprawdź, czy ID użytkownika w sesji zgadza się z zalogowanym użytkownikiem
    const userId = session.metadata?.userId;
    
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Niezgodność ID użytkownika" },
        { status: 403 }
      );
    }

    // Pobierz dane subskrypcji
    const subscription = session.subscription as Stripe.Subscription;
    
    if (!subscription || !subscription.id) {
      return NextResponse.json(
        { error: "Brak danych subskrypcji" },
        { status: 400 }
      );
    }

    // Pobierz istniejącą subskrypcję użytkownika, aby zachować niektóre wartości
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("current_offers, total_offers, cv_creator_used")
      .eq("user_id", user.id)
      .single();

    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);

    // Aktualizuj tabelę subscriptions
    const { error: updateError } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan: "premium",
        status: "active",
        start_date: periodStart.toISOString(),
        end_date: periodEnd.toISOString(),
        stripe_subscription_id: subscription.id,
        current_limit: null,
        total_limit: null,
        current_offers: existingSubscription?.current_offers ?? 0,
        total_offers: existingSubscription?.total_offers ?? 0,
        cv_creator_limit: 50, // Zwiększony limit dla planu premium
        cv_creator_used: existingSubscription?.cv_creator_used ?? 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (updateError) {
      console.error("Błąd podczas aktualizacji subskrypcji:", updateError);
      return NextResponse.json(
        { error: "Nie udało się zaktualizować subskrypcji" },
        { status: 500 }
      );
    }

    // Powiadomienie o aktywacji subskrypcji
    await supabase.rpc("notify_subscribers", {
      p_user_id: user.id,
      p_notification_type: "subscription_activated",
      p_message: "Subskrypcja Premium aktywowana!",
    });

    // Płatność została zweryfikowana i subskrypcja zaktualizowana
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd podczas weryfikacji płatności:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas weryfikacji płatności" },
      { status: 500 }
    );
  }
} 