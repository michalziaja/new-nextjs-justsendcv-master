//api/create-checkout/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicjalizacja Stripe z kluczem API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Definicje cen planów
const PRICE_IDS = {
  premium_weekly: process.env.STRIPE_PREMIUM_WEEKLY_PRICE_ID!,
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  premium_quarterly: process.env.STRIPE_PREMIUM_QUARTERLY_PRICE_ID!,  
};

export async function POST(request: Request) {
  try {
    // Uzyskaj sesję użytkownika z Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Brak autoryzowanego użytkownika:", authError?.message);
      return NextResponse.json({ error: "Nieautoryzowany użytkownik" }, { status: 401 });
    }

    // Pobierz dane z requestu
    const { planId, userId, interval } = await request.json();

    // Sprawdź, czy planId jest wspieranym ID
    if (!planId || !PRICE_IDS[planId as keyof typeof PRICE_IDS]) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator planu" }, { status: 400 });
    }

    // Sprawdź, czy ID użytkownika zgadza się z sesją
    if (userId !== user.id) {
      return NextResponse.json({ error: "Niezgodność ID użytkownika" }, { status: 400 });
    }

    // Pobierz URL aplikacji z zmiennych środowiskowych
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://83e2-2a01-115f-4902-7900-8d6e-e943-9c59-b01e.ngrok-free.app/';

    // Stwórz sesję płatności Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_IDS[planId as keyof typeof PRICE_IDS],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/upgrade`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: planId,
        interval: interval
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId,
          interval: interval
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Błąd podczas tworzenia sesji płatności:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia sesji płatności" },
      { status: 500 }
    );
  }
} 