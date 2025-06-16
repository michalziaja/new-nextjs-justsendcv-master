import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: { headers: request.headers },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );

    // Próba pobrania użytkownika z lepszą obsługą błędów
    let user = null;
    let authError = null;
    
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      user = currentUser;
      authError = error;
    } catch (error) {
      console.error("Błąd podczas pobierania użytkownika:", error);
      // Jeśli błąd związany z refresh tokenem, wyczyść wszystkie cookies auth
      if (error instanceof Error && error.message.includes('refresh_token_not_found')) {
        // Usuń wszystkie cookies związane z auth
        const authCookies = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token'];
        authCookies.forEach(cookieName => {
          response.cookies.delete(cookieName);
        });
        
        // Przekieruj na stronę logowania jeśli nie jest to publiczna ścieżka
        const publicRoutes = ["/", "/sign-in", "/sign-up", "/forgot-password", "/unauthorized", "/auth/callback"];
        const isArticlePage = request.nextUrl.pathname.startsWith('/article/');
        const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname) || isArticlePage;
        
        if (!isPublicRoute) {
          return NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
        }
      }
    }

    const publicRoutes = ["/", "/sign-in", "/sign-up", "/forgot-password", "/unauthorized", "/auth/callback"];
    // Sprawdzanie czy ścieżka zaczyna się od /article/
    const isArticlePage = request.nextUrl.pathname.startsWith('/article/');
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname) || isArticlePage;

    // Przekieruj niezalogowanych użytkowników z chronionych tras na /unauthorized
    if (!user && !isPublicRoute) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Przekieruj zalogowanych użytkowników z tras logowania na /home
    if (user && ["/sign-in", "/sign-up", "/forgot-password", "/unauthorized"].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return response;
  } catch (e) {
    console.error("Middleware error:", e);
    
    // Jeśli błąd związany z refresh tokenem, wyczyść cookies i przekieruj
    if (e instanceof Error && e.message.includes('refresh_token_not_found')) {
      const response = NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
      
      // Usuń wszystkie cookies związane z auth
      const authCookies = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token'];
      authCookies.forEach(cookieName => {
        response.cookies.delete(cookieName);
      });
      
      return response;
    }
    
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }
};