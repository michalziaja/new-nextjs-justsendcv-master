//utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// Tworzymy wersję klienta z cachowaniem użytkownika
export const createClient = () => {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Nadpisujemy metodę getUser, aby korzystała z cache
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
      
      // Zapisujemy wynik w cache
      sessionStorage.setItem('cached_user_data', JSON.stringify(response));
      
      return response;
    } finally {
      // Oznaczamy, że zapytanie zostało zakończone
      sessionStorage.removeItem('user_request_in_progress');
    }
  };

  return client;
};
