import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Konfiguracja Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL")!; // Dodano '!' dla pewności, że zmienne istnieją
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Dodano '!'
const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req: Request) => {
  // Nagłówki CORS
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // W produkcji zawęź do domeny rozszerzenia
    "Access-Control-Allow-Methods": "POST, OPTIONS", // Ograniczamy metody
    "Access-Control-Allow-Headers": "Authorization, X-Client-Info, Content-Type", // Usunięto X-User-Id
  };

  // Obsługa OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Oczekujemy tylko metody POST
  if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" }), {
          status: 405,
          headers: corsHeaders,
      });
  }

  try {
    // Pobierz user_id z nagłówka Authorization (JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Authorization header missing or invalid");
      return new Response(JSON.stringify({ success: false, error: "Brak tokenu autoryzacji" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    let userId: string | null = null;
    try {
        const token = authHeader.replace("Bearer ", "");
        // Bezpieczniejsze pobranie użytkownika z tokenu za pomocą wbudowanej funkcji Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            console.error("Error getting user from token:", userError);
            throw new Error("Nieprawidłowy token lub błąd autoryzacji");
        }
        userId = user.id;
    } catch(e) {
         console.error("Error processing token:", e);
         // Sprawdzamy typ błędu przed dostępem do 'message'
         const errorMessage = e instanceof Error ? e.message : "Błąd autoryzacji (nieznany typ błędu)";
         return new Response(JSON.stringify({ success: false, error: errorMessage }), {
            status: 401,
            headers: corsHeaders,
          });
    }


    if (!userId) { // Dodatkowe sprawdzenie
      console.error("User ID is null after auth check");
      return new Response(JSON.stringify({ success: false, error: "Nie udało się zidentyfikować użytkownika" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log(`Processing save request for user_id: ${userId}`);

    // Pobierz body żądania
    let body: any;
    try {
        body = await req.json();
    } catch (e) {
        console.error("Error parsing request body:", e);
        return new Response(JSON.stringify({ success: false, error: "Nieprawidłowy format danych żądania" }), {
            status: 400,
            headers: corsHeaders,
        });
    }

    // Destrukturyzacja z poprawnymi nazwami pól + dodanie salary i expire
    const { site, title, company, url, full_description, salary, expire } = body;

    // Podstawowa walidacja
    if (!title || !company || !url || !site) { // Dodano site do walidacji
      console.warn("Missing required fields:", { title, company, url, site });
      return new Response(JSON.stringify({ success: false, error: "Brak wymaganych danych oferty (title, company, url, site)" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // ** Walidacja formatu daty (opcjonalna, ale zalecana) **
    let validExpireDate: string | null = null;
    if (expire) {
        // Sprawdzamy czy data jest w formacie YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(expire)) {
            validExpireDate = expire;
        } else {
            console.warn(`Invalid date format for expire: ${expire}. Setting to null.`);
            // Można zwrócić błąd 400 lub po prostu ustawić na null
            // return new Response(JSON.stringify({ success: false, error: "Nieprawidłowy format daty wygaśnięcia (oczekiwano YYYY-MM-DD)" }), {
            //     status: 400,
            //     headers: corsHeaders,
            // });
        }
    }


    // Sprawdzenie subskrypcji przed zapisem
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("id, current_offers, total_offers, current_limit, total_limit, plan")
      .eq("user_id", userId)
      .single(); // .single() zwróci błąd jeśli nie ma rekordu lub jest więcej niż jeden

    if (subError) {
      // Jeśli błąd to PGRST116 (brak wierszy), traktujemy to jako brak subskrypcji
      if (subError.code === 'PGRST116') {
          console.error(`Subscription not found for user ${userId}`);
          return new Response(JSON.stringify({ success: false, error: "Nie znaleziono subskrypcji użytkownika" }), {
              status: 404, // Not Found
              headers: corsHeaders,
            });
      }
      // Inne błędy bazy danych
      console.error("Subscription query error:", subError);
      return new Response(JSON.stringify({ success: false, error: "Błąd podczas sprawdzania subskrypcji" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    console.log("Found subscription:", subscription);

    // Wywołanie funkcji RPC save_job_offer z poprawnymi parametrami
    console.log("Calling RPC save_job_offer with:", {
        p_user_id: userId,
        p_site: site,
        p_title: title,
        p_company: company,
        p_url: url,
        p_full_description: full_description, // Używamy poprawnej nazwy
        p_salary: salary, // Dodano
        p_expire: validExpireDate, // Dodano (przekazujemy sprawdzoną datę lub null)
    });

    const { data: rpcData, error: rpcError } = await supabase.rpc("save_job_offer", {
      p_user_id: userId,
      p_site: site,
      p_title: title,             // Poprawny parametr
      p_company: company,
      p_url: url,
      p_full_description: full_description, // Poprawny parametr
      p_salary: salary,             // Dodano
      p_expire: validExpireDate     // Dodano (przekazujemy sprawdzoną datę lub null)
    });

    // Obsługa błędów RPC (w tym limitu)
    if (rpcError) {
      console.error("RPC save_job_offer error:", rpcError);
      if (rpcError.message === "limit_reached") {
        console.log(`Limit reached for user ${userId}.`);
        let notifications = [];
        let status = "limit_reached";

        // Sprawdzamy, który limit został osiągnięty na podstawie danych subskrypcji
        // (Funkcja RPC rzuca tylko ogólny błąd 'limit_reached')
        if (subscription.total_limit !== null && subscription.total_offers >= subscription.total_limit) {
            const totalLimitMessage = "Osiągnąłeś całkowity limit – przejdź na Premium.";
            notifications.push({ type: "limit_reached_total", message: totalLimitMessage, action: "upgrade" });
            // Zapis powiadomienia do bazy (opcjonalny, ale spójny z kodem)
            await supabase.from("notifications").insert({ /* ... */ });
        } else if (subscription.current_limit !== null && subscription.current_offers >= subscription.current_limit) {
            const currentLimitMessage = "Osiągnąłeś limit – usuń oferty lub przejdź na Premium.";
            notifications.push({ type: "limit_reached_current", message: currentLimitMessage, action: "upgrade" });
            // Zapis powiadomienia do bazy (opcjonalny)
            await supabase.from("notifications").insert({ /* ... */ });
        } else {
            // Fallback, jeśli błąd RPC to limit_reached, ale dane subskrypcji na to nie wskazują
            console.warn("RPC reported limit_reached, but subscription data doesn't confirm. Sending generic limit message.");
             const genericLimitMessage = "Osiągnąłeś limit zapisanych ofert.";
             notifications.push({ type: "limit_reached_unknown", message: genericLimitMessage, action: "upgrade" });
        }


        return new Response(
          JSON.stringify({
            success: true, // Zgodnie z logiką w main.js, limit zwraca success: true
            status: status,
            // subscription: subscription, // Zwracamy subskrypcję sprzed zapisu, bo zapis się nie udał
            notifications: notifications,
          }),
          { status: 200, headers: corsHeaders } // Status 200 dla limitu
        );
      }
      // Inne błędy RPC
      return new Response(JSON.stringify({ success: false, error: "Błąd podczas zapisu oferty w bazie danych" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Sprawdzenie czy RPC zwróciło dane (powinno zwrócić tablicę z jednym obiektem {id: uuid})
     if (!rpcData || !Array.isArray(rpcData) || rpcData.length === 0 || !rpcData[0].id) {
        console.error("RPC save_job_offer did not return the expected ID.");
        return new Response(JSON.stringify({ success: false, error: "Nie otrzymano potwierdzenia zapisu oferty" }), {
            status: 500,
            headers: corsHeaders,
          });
     }

     const insertedOfferId = rpcData[0].id;
     console.log(`Offer saved successfully with ID: ${insertedOfferId} for user ${userId}`);

    // Pobierz zaktualizowaną subskrypcję PO udanym zapisie
    // Używamy danych z subskrypcji *przed* zapisem i inkrementujemy liczniki
    // To jest mniej kosztowne niż kolejne zapytanie SELECT
    const updatedSubscriptionData = {
        ...subscription, // Kopiujemy stare dane
        current_offers: subscription.current_offers + 1,
        total_offers: subscription.total_offers + 1,
    };

    // Przygotuj powiadomienia o osiągnięciu limitu/progu PO zapisie
    let notificationsAfterSave = [];
    // Osiągnięcie limitu total
    if (updatedSubscriptionData.total_limit !== null && updatedSubscriptionData.total_offers === updatedSubscriptionData.total_limit) {
        const totalLimitMessage = "Osiągnąłeś całkowity limit – przejdź na Premium.";
        notificationsAfterSave.push({ type: "limit_reached_total", message: totalLimitMessage, action: "upgrade" });
        await supabase.from("notifications").insert({ user_id: userId, type: "limit_reached_total", message: totalLimitMessage, /* ... */ });
    }
    // Osiągnięcie limitu current (jeśli total nie osiągnięty)
    else if (updatedSubscriptionData.current_limit !== null && updatedSubscriptionData.current_offers === updatedSubscriptionData.current_limit) {
        const currentLimitMessage = "Osiągnąłeś limit – usuń oferty lub przejdź na Premium.";
        notificationsAfterSave.push({ type: "limit_reached_current", message: currentLimitMessage, action: "upgrade" });
         await supabase.from("notifications").insert({ user_id: userId, type: "limit_reached_current", message: currentLimitMessage, /* ... */ });
    }
    // Osiągnięcie progu 80% total
    const totalLimitPercentageBefore = subscription.total_limit ? (subscription.total_offers / subscription.total_limit) * 100 : 0;
    const totalLimitPercentageAfter = updatedSubscriptionData.total_limit ? (updatedSubscriptionData.total_offers / updatedSubscriptionData.total_limit) * 100 : 0;
    if (totalLimitPercentageAfter >= 80 && totalLimitPercentageBefore < 80) {
        const total80Message = "Osiągnąłeś 80% limitu Free – przejdź na Premium.";
        notificationsAfterSave.push({ type: "limit_warning_total", message: total80Message, action: "upgrade" });
        await supabase.from("notifications").insert({ user_id: userId, type: "limit_warning_total", message: total80Message, /* ... */ });
    }


    // Zwróć odpowiedź sukcesu
    return new Response(
      JSON.stringify({
        success: true,
        offer_id: insertedOfferId, // Zwracamy ID z RPC
        subscription: updatedSubscriptionData, // Zwracamy zaktualizowane (obliczone) dane subskrypcji
        ...(notificationsAfterSave.length > 0 && { notifications: notificationsAfterSave }),
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    // Ogólny błąd funkcji brzegowej
    console.error("Edge Function critical error:", error);
    return new Response(JSON.stringify({ success: false, error: "Wewnętrzny błąd serwera" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});