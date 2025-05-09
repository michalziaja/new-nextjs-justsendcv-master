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

    const { data: { user }, error } = await supabase.auth.getUser();

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
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }
};