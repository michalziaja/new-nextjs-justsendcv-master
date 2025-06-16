//utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// Tworzymy wersję klienta z cachowaniem użytkownika i obsługą błędów
export const createClient = () => {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Dodajemy obsługę błędów refresh tokenów
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token został odświeżony');
    }
    
    if (event === 'SIGNED_OUT') {
      // Wyczyść cache gdy użytkownik się wyloguje
      sessionStorage.removeItem('cached_user_data');
      sessionStorage.removeItem('user_request_in_progress');
      sessionStorage.removeItem('user_request_last_time');
    }
  });

  // Nadpisujemy metodę getUser, aby korzystała z cache i lepiej obsługiwała błędy
  const originalGetUser = client.auth.getUser;
  client.auth.getUser = async function() {
    // Sprawdzamy, czy zapytanie o użytkownika jest już w trakcie
    const isUserRequestInProgress = sessionStorage.getItem('user_request_in_progress');
    const lastUserRequestTime = sessionStorage.getItem('user_request_last_time');
    
    // Jeśli zapytanie jest w trakcie lub wykonano je w ciągu ostatnich 5 sekund, korzystamy z cache
    if (isUserRequestInProgress === 'true' || 
       (lastUserRequestTime && Date.now() - parseInt(lastUserRequestTime) < 5000)) {
      
      // Próbujemy pobrać dane z cache
      const cachedUserData = sessionStorage.getItem('cached_user_data');
      if (cachedUserData) {
        try {
          return JSON.parse(cachedUserData);
        } catch (e) {
          console.error('Błąd podczas parsowania danych użytkownika z cache:', e);
        }
      }
    }
    
    // Oznaczamy, że zapytanie jest w trakcie
    sessionStorage.setItem('user_request_in_progress', 'true');
    sessionStorage.setItem('user_request_last_time', Date.now().toString());
    
    try {
      // Wywołujemy oryginalne zapytanie
      const response = await originalGetUser.call(this);
      
      // Sprawdzamy czy nie ma błędu związanego z refresh tokenem
      if (response.error && response.error.message.includes('refresh_token_not_found')) {
        console.error('Błąd refresh tokenu - automatyczne wylogowanie');
        
        // Wyczyść cache i sesję
        sessionStorage.removeItem('cached_user_data');
        sessionStorage.removeItem('user_request_in_progress');
        sessionStorage.removeItem('user_request_last_time');
        
        // Wyloguj użytkownika
        await this.signOut();
        
        // Przekieruj na stronę logowania
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in?error=session_expired';
        }
        
        return { data: { user: null }, error: response.error };
      }
      
      // Zapisujemy wynik w cache tylko jeśli nie ma błędu
      if (!response.error) {
        sessionStorage.setItem('cached_user_data', JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('Błąd podczas pobierania użytkownika:', error);
      
      // Jeśli błąd związany z refresh tokenem
      if (error instanceof Error && error.message.includes('refresh_token_not_found')) {
        // Wyczyść cache i sesję
        sessionStorage.removeItem('cached_user_data');
        sessionStorage.removeItem('user_request_in_progress');
        sessionStorage.removeItem('user_request_last_time');
        
        // Wyloguj użytkownika
        await this.signOut();
        
        // Przekieruj na stronę logowania
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in?error=session_expired';
        }
      }
      
      throw error;
    } finally {
      // Oznaczamy, że zapytanie zostało zakończone
      sessionStorage.removeItem('user_request_in_progress');
    }
  };

  return client;
};
