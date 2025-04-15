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
    { title: "Asystent AI", url: "/assist", icon: Brain },
    { title: "Terminarz", url: "/scheduler", icon: Calendar },
    { title: "Kalkulator", url: "/calculator", icon: Calculator },
    { title: "Statystyki", url: "/stats", icon: PieChart },
    { title: "Trening", url: "#", icon: Dumbbell },
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
      className="text-lg top-16 h-[calc(97vh-4.5rem)] mt-4 border-1 border-gray-100 rounded-sm bg-white dark:bg-sidebar dark:border-slate-800 shadow-2xl dark:shadow-background"
      {...props}
    >
      <SidebarContent className="p-0 mt-4">
        <NavMain items={data.navMain} />
        <NavSecondary userData={userData} items={data.navSecondary} className="mt-8" />
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-slate-800">
        <NavUser userData={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}