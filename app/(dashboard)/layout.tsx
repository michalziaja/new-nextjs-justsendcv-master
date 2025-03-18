//app/(dashboard)/layout.tsx
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Pobierz dane subskrypcji z tabeli profiles
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("is_subscribed")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    console.error("Błąd pobierania profilu:", profileError);
    // Możesz zdecydować, co zrobić w przypadku błędu, np. ustawić domyślnie false
  }

  const userData = {
    id: user.id,
    name: user.user_metadata?.name || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || "",
    isSubscribed: profile?.is_subscribed || false, // Domyślnie false, jeśli brak danych
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] bg-background">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar userData={userData} />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}