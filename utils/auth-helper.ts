import { createClient } from "@/utils/supabase/client";

/**
 * Funkcja pomocnicza do czyszczenia nieprawidłowych sesji
 * Wywoływana gdy wystąpi błąd refresh_token_not_found
 */
export const clearInvalidSession = async () => {
  try {
    const supabase = createClient();
    
    // Wyloguj użytkownika z Supabase
    await supabase.auth.signOut();
    
    // Wyczyść localStorage i sessionStorage
    if (typeof window !== 'undefined') {
      // Usuń wszystkie klucze związane z auth
      const keysToRemove = [
        'cached_user_data',
        'user_request_in_progress', 
        'user_request_last_time',
        'supabase.auth.token',
        'sb-access-token',
        'sb-refresh-token'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Wyczyść wszystkie cookies związane z auth
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('sb-') || name.includes('supabase')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    }
    
    console.log('Nieprawidłowa sesja została wyczyszczona');
  } catch (error) {
    console.error('Błąd podczas czyszczenia sesji:', error);
  }
};

/**
 * Funkcja pomocnicza do sprawdzania stanu sesji
 * Zwraca true jeśli sesja jest prawidłowa
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Błąd podczas sprawdzania sesji:', error);
      
      // Jeśli błąd związany z refresh tokenem, wyczyść sesję
      if (error.message.includes('refresh_token_not_found')) {
        await clearInvalidSession();
        return false;
      }
    }
    
    return !!session;
  } catch (error) {
    console.error('Wyjątek podczas sprawdzania sesji:', error);
    return false;
  }
};

/**
 * Hook do sprawdzania sesji przy inicjalizacji komponentów
 */
export const useSessionValidation = () => {
  const checkSession = async () => {
    const isValid = await validateSession();
    
    if (!isValid && typeof window !== 'undefined') {
      // Jeśli sesja nieważna i nie jesteśmy na publicznej stronie
      const publicPaths = ['/', '/sign-in', '/sign-up', '/forgot-password'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/sign-in?error=session_expired';
      }
    }
    
    return isValid;
  };
  
  return { checkSession };
};

/**
 * Funkcja do odświeżania sesji z obsługą błędów
 */
export const refreshSession = async (): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Błąd podczas odświeżania sesji:', error);
      
      if (error.message.includes('refresh_token_not_found')) {
        await clearInvalidSession();
        return false;
      }
    }
    
    return !!data.session;
  } catch (error) {
    console.error('Wyjątek podczas odświeżania sesji:', error);
    return false;
  }
}; 