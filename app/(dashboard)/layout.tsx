
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
    redirect("/sign-in");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("subscription")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    console.error("Błąd pobierania profilu:", profileError);
  }

  const userData = {
    id: user.id,
    name: user.user_metadata?.name || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || null,
    isSubscribed: profile?.subscription || false,
    createdAt: user.created_at, // Data założenia konta
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