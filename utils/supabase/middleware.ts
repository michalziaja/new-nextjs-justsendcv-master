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

    const { data: { session }, error } = await supabase.auth.getSession();

    // Publiczne trasy dostępne dla wszystkich
    const publicRoutes = ["/", "/sign-in", "/sign-up", "/forgot-password", "/unauthorized", "/auth/callback"];
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

    // Zalogowany użytkownik na stronach logowania -> przekierowanie do /dashboard
    if (session && ["/sign-in", "/sign-up", "/forgot-password", "/unauthorized"].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Niezalogowany użytkownik na zabezpieczonej trasie -> przekierowanie do /unauthorized
    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return response;
  } catch (e) {
    console.error("Middleware error:", e);
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }
};