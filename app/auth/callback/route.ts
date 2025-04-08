// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.searchParams.get("origin") || requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  // Sprawdź czy to adres ngrok i użyj go zamiast localhost
  const ngrockUrl = "https://fe42-2a01-115f-4902-7900-a5f6-1948-b1c1-becc.ngrok-free.app/";
  const finalOrigin = origin.includes("localhost") ? ngrockUrl : origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Błąd podczas wymiany kodu na sesję:", error.message);
      return NextResponse.redirect(`${finalOrigin}/sign-in?error=auth_failed`);
    }

    if (data.user) {
      await createOrUpdateProfile(data.user, supabase);
    }
  }

  // Przekieruj na stronę docelową lub domyślnie na /home
  if (redirectTo) {
    return NextResponse.redirect(`${finalOrigin}${redirectTo}`);
  }

  return NextResponse.redirect(`${finalOrigin}/home`);
}

async function createOrUpdateProfile(user: any, supabase: any) {
  const userId = user.id;
  const email = user.email;

  const rawMetadata = user.user_metadata || {};
  console.log("Raw user metadata:", rawMetadata);

  const fullName = rawMetadata.full_name || rawMetadata.name || "";
  let firstName = null;
  let lastName = null;

  if (fullName) {
    const nameParts = fullName.trim().split(" ");
    firstName = nameParts[0] || null;
    lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;
  }

  if (!firstName && !lastName) {
    console.warn("Brak danych imienia i nazwiska w raw_user_metadata dla użytkownika:", userId);
  }

  // Sprawdź czy profil już istnieje
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Błąd podczas pobierania profilu:", fetchError.message);
    return;
  }

  // Jeśli profil nie istnieje, utwórz go
  if (!existingProfile) {
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
    });

    if (profileError) {
      console.error("Błąd podczas tworzenia profilu:", profileError.message);
      return;
    }

    console.log("Profil został utworzony dla użytkownika:", userId);

    // Sprawdź czy użytkownik ma już subskrypcję
    const { data: existingSubscription, error: subFetchError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (subFetchError && subFetchError.code !== "PGRST116") {
      console.error("Błąd podczas sprawdzania subskrypcji:", subFetchError.message);
      return;
    }

    // Jeśli nie ma subskrypcji, utwórz darmową
    if (!existingSubscription) {
      const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        plan: "free",
        status: "active",
        start_date: new Date().toISOString(),
        current_limit: 10,
        total_limit: 20,
        cv_creator_limit: 3,
        cv_creator_used: 0,
        current_offers: 0,
        total_offers: 0,
      });

      if (subError) {
        console.error("Błąd podczas tworzenia subskrypcji:", subError.message);
        return;
      }

      console.log("Utworzono darmową subskrypcję dla użytkownika:", userId);
    }
  }
}