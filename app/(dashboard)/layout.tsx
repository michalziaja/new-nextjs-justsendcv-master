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

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  if (subscriptionError) {
    console.error("Błąd pobierania subskrypcji:", subscriptionError);
  }

  const userData = {
    id: user.id,
    name: user.user_metadata?.name || user.user_metadata?.first_name + " " + user.user_metadata?.last_name || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || null,
    isSubscribed: subscription?.plan === "premium" || false,
    createdAt: user.created_at, // Data założenia konta
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] bg-background relative">
      {/* Tło z siatką */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808011_1px,transparent_1px),linear-gradient(to_bottom,#80808011_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_90%)]" />
      </div>
      <SidebarProvider className="flex flex-col relative z-10">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar userData={userData} />
          <SidebarInset className="bg-transparent">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}