//components/app-sidebar.tsx
"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  BookmarkCheck,
  FileText,
  Brain,
  Dumbbell,
  UserCircle,
  PieChart,
  Calendar,
  Calculator,
  TrendingUp,
} from "lucide-react";

// Definicja typu UserData z createdAt
type UserData = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isSubscribed: boolean;
  createdAt: string;
};

const data = {
  navMain: [
    { title: "Home", url: "/home", icon: Home },
    { title: "Zapisane", url: "/saved", icon: BookmarkCheck },
    { title: "Kreator CV", url: "/creator", icon: FileText },
    { title: "Asystent AI", url: "/ai-assistant", icon: Brain },
    { title: "Kariera", url: "/roadmap", icon: TrendingUp },
    { title: "Zadania", url: "/scheduler", icon: Calendar },
    { title: "Kalkulator", url: "/calculator", icon: Calculator },
    { title: "Statystyki", url: "/stats", icon: PieChart },
    { title: "Trening", url: "/trening", icon: Dumbbell },
    { title: "Profil", url: "/profile", icon: UserCircle },
  ],
  navSecondary: [],
};

export function AppSidebar({
  userData,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userData: UserData }) {
  return (
    <Sidebar
      className="text-lg top-11.5 h-[calc(99vh-4.5rem)] mt-4.5 border-0 border-gray-200 rounded-sm bg-white dark:bg-slate-900 dark:border-slate-800 shadow-[2px_4px_8px_rgba(0,0,0,0.2)] dark:shadow-background"
      {...props}
    >
      <SidebarContent className="p-0 mt-4 bg-white dark:bg-slate-900">
        <NavMain items={data.navMain}  />
        <NavSecondary userData={userData} items={data.navSecondary} className="mt-8 bg-white dark:bg-slate-900" />
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <NavUser userData={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}