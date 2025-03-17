// // app/(dashboard)/layout.tsx
// "use client"
// import { AppSidebar } from "@/components/app-sidebar"
// import { SiteHeader } from "@/components/site-header"
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
// import UserInitializer from "@/components/UserInitializer"


// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="[--header-height:calc(--spacing(14))] bg-background">
//       <UserInitializer />
//       <SidebarProvider className="flex flex-col">
//           <SiteHeader />
//               <div className="flex flex-1">
//                   <AppSidebar />
//                   <SidebarInset>
//                       {children}
//                   </SidebarInset>
//               </div>
//       </SidebarProvider>    
//     </div>
//   );
// }
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
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  const userData = {
    id: user.id,
    name: user.user_metadata?.name || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || "",
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