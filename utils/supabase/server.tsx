//utils/supabase/server.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error('Błąd podczas ustawiania cookies:', error);
          }
        },
      },
    },
  );
};

/**
 * Funkcja pomocnicza do bezpiecznego pobierania użytkownika po stronie serwera
 * Z obsługą błędów refresh tokenów
 */
export const getUser = async () => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Błąd podczas pobierania użytkownika (server):', error);
      
      // Jeśli błąd związany z refresh tokenem, zwróć null
      if (error.message.includes('refresh_token_not_found')) {
        return { user: null, error: 'refresh_token_expired' };
      }
      
      return { user: null, error: error.message };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Wyjątek podczas pobierania użytkownika (server):', error);
    return { user: null, error: 'server_error' };
  }
};

/**
 * Funkcja pomocnicza do bezpiecznego pobierania sesji po stronie serwera
 */
export const getSession = async () => {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Błąd podczas pobierania sesji (server):', error);
      
      // Jeśli błąd związany z refresh tokenem, zwróć null
      if (error.message.includes('refresh_token_not_found')) {
        return { session: null, error: 'refresh_token_expired' };
      }
      
      return { session: null, error: error.message };
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('Wyjątek podczas pobierania sesji (server):', error);
    return { session: null, error: 'server_error' };
  }
};
