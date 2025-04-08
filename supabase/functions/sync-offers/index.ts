import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Konfiguracja Supabase (pobierana ze zmiennych środowiskowych)
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Używamy klucza serwisowego do pobierania danych w imieniu użytkownika (po autoryzacji)
const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log("Funkcja 'sync-offers' zainicjowana.");

serve(async (req: Request) => {
  // Nagłówki CORS - ważne dla żądań z przeglądarki (rozszerzenia)
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // W środowisku produkcyjnym zawęź do konkretnej domeny lub ID rozszerzenia
    "Access-Control-Allow-Methods": "GET, OPTIONS", // Ta funkcja obsługuje tylko GET i preflight OPTIONS
    "Access-Control-Allow-Headers": "Authorization, X-Client-Info, Content-Type", // Nagłówki wymagane przez Supabase i do przesyłania danych
  };

  // Obsługa żądania OPTIONS (preflight) - wymagane przez przeglądarki przed żądaniem GET z niestandardowymi nagłówkami
  if (req.method === "OPTIONS") {
    console.log("Obsługa żądania OPTIONS (preflight)");
    return new Response(null, { status: 204, headers: corsHeaders }); // 204 No Content
  }

  // Oczekujemy tylko metody GET
  if (req.method !== "GET") {
    console.warn(`Nieobsługiwana metoda: ${req.method}`);
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" }), {
      status: 405, // Method Not Allowed
      headers: corsHeaders,
    });
  }

  console.log("Otrzymano żądanie GET do synchronizacji ofert.");

  try {
    // --- Krok 1: Autentykacja Użytkownika ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Brak lub nieprawidłowy nagłówek Authorization.");
      return new Response(JSON.stringify({ success: false, error: "Brak tokenu autoryzacji" }), {
        status: 401, // Unauthorized
        headers: corsHeaders,
      });
    }

    let userId: string | null = null;
    try {
      const token = authHeader.replace("Bearer ", "");
      console.log("Próba weryfikacji tokenu autoryzacyjnego...");
      // Weryfikacja tokenu i pobranie danych użytkownika
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError) {
        console.error("Błąd podczas weryfikacji tokenu:", userError.message);
        // Zwracamy bardziej szczegółowy błąd, jeśli jest dostępny
        throw new Error(`Błąd autoryzacji: ${userError.message}`);
      }
      if (!user) {
         // Ten przypadek nie powinien wystąpić, jeśli userError jest null, ale dla pewności
         console.error("Nie znaleziono użytkownika dla podanego tokenu (user jest null).");
         throw new Error("Nieprawidłowy token lub użytkownik nie istnieje");
      }

      userId = user.id;
      console.log(`Pomyślnie zautentykowano. User ID: ${userId}`);

    } catch (e) {
      // Obsługa błędów związanych z tokenem (np. wygaśnięcie, nieprawidłowy format)
      const errorMessage = e instanceof Error ? e.message : "Błąd autoryzacji (nieznany typ)";
      console.error("Błąd podczas przetwarzania tokenu:", errorMessage);
      return new Response(JSON.stringify({ success: false, error: errorMessage }), {
        status: 401, // Unauthorized
        headers: corsHeaders,
      });
    }

    // --- Krok 2: Pobieranie Ofert z Bazy Danych ---
    console.log(`Pobieranie ofert z tabeli 'job_offers' dla użytkownika: ${userId}`);

    // Wybieramy tylko te kolumny, które są potrzebne do synchronizacji w rozszerzeniu
    const { data: offers, error: dbError } = await supabase
      .from("job_offers") // Używamy poprawnej nazwy tabeli
      .select("id, url, title, company, created_at") // Wybieramy kolumny potrzebne dla klienta
      .eq("user_id", userId); // Filtrujemy oferty należące do zalogowanego użytkownika

    // Obsługa błędów zapytania do bazy danych
    if (dbError) {
      console.error("Błąd zapytania do bazy danych podczas pobierania ofert:", dbError.message);
      return new Response(JSON.stringify({ success: false, error: "Błąd podczas pobierania ofert z bazy danych" }), {
        status: 500, // Internal Server Error
        headers: corsHeaders,
      });
    }

    console.log(`Pomyślnie pobrano ${offers?.length ?? 0} ofert dla użytkownika ${userId}.`);

    // --- Krok 3: Zwrócenie Wyników ---
    // Zwracamy pobrane oferty (lub pustą tablicę, jeśli użytkownik nie ma zapisanych ofert)
    return new Response(
      JSON.stringify({
        success: true,
        data: offers || [] // Zawsze zwracaj tablicę, nawet jeśli jest pusta
      }),
      {
        status: 200, // OK
        headers: corsHeaders,
      }
    );

  } catch (error) {
    // Ogólna obsługa nieprzewidzianych błędów w funkcji
    const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
    console.error("Krytyczny błąd w funkcji 'sync-offers':", errorMessage);
    return new Response(JSON.stringify({ success: false, error: `Wewnętrzny błąd serwera: ${errorMessage}` }), {
      status: 500, // Internal Server Error
      headers: corsHeaders,
    });
  }
});
