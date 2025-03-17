// app/components/app-sidebar.tsx
// "use client"

// import * as React from "react"
// import Image from "next/image"
// import {
//   BookOpen,
//   Bot,
//   Command,
//   Frame,
//   Home,
//   BookmarkCheck,
//   FileText,
//   Brain,
//   Dumbbell,
//   UserCircle,
//   LifeBuoy,
//   Map,
//   PieChart,
//   Send,
//   Settings2,
//   SquareTerminal,
//   Calendar,
//   LogOut
// } from "lucide-react"
// import homeIcon from "@/public/ikony/home.png"
// import { NavMain } from "@/components/nav-main"
// // import { NavProjects } from "@/components/nav-projects"
// import { NavSecondary } from "@/components/nav-secondary"
// import { NavUser } from "@/components/nav-user"
// import { signOutAction } from "@/app/actions"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarSeparator
// } from "@/components/ui/sidebar"

// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   navMain: [
//     {
//       title: "Home",
//       url: "/dashboard",
//       icon: Home,
//     },
//     {
//       title: "Zapisane",
//       url: "/saved",
//       icon: BookmarkCheck,
//     },
//     {
//       title: "Kreator CV",
//       url: "/cv-creator",
//       icon: FileText,
//     },
//     {
//       title: "Asystent AI",
//       url: "/assist",
//       icon: Brain,
//     },
//     {
//       title: "Terminarz",
//       url: "/calendar",
//       icon: Calendar,
//     },
//     {
//       title: "Statystyki",
//       url: "/stats",
//       icon: PieChart,
//     },
//     {
//       title: "Trening",
//       url: "#",
//       icon: Dumbbell,
//     },
//     {
//       title: "Profil",
//       url: "#",
//       icon: UserCircle,
//     }
//   ],
//   navSecondary: [],
  
// }

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar
//       className="text-2xl top-16 h-[calc(97vh-4.5rem)] mt-4 border-1 border-gray-100 rounded-md bg-white dark:bg-sidebar dark:border-slate-800
//       shadow-[2px_4px_10px_rgba(0,0,0,0.3)] dark:shadow-background"
//       {...props}
//     >
//       <SidebarContent className="p-0 mt-4 text-2xl">
//         <NavMain items={data.navMain} />
        
//         <NavSecondary items={data.navSecondary} className="mt-8" isPremium={false} />
//       </SidebarContent>
//       <SidebarFooter className="border-t border-gray-200 dark:border-slate-800">
//         <NavUser />
//       </SidebarFooter>
//     </Sidebar>
//   )
// }


"use client";

import * as React from "react";
import Image from "next/image";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  Home,
  BookmarkCheck,
  FileText,
  Brain,
  Dumbbell,
  UserCircle,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Calendar,
  LogOut,
} from "lucide-react";
import homeIcon from "@/public/ikony/home.png";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { signOutAction } from "@/app/actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Definicja typu UserData
type UserData = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

// Dane statyczne dla NavMain i NavSecondary
const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Zapisane",
      url: "/saved",
      icon: BookmarkCheck,
    },
    {
      title: "Kreator CV",
      url: "/cv-creator",
      icon: FileText,
    },
    {
      title: "Asystent AI",
      url: "/assist",
      icon: Brain,
    },
    {
      title: "Terminarz",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "Statystyki",
      url: "/stats",
      icon: PieChart,
    },
    {
      title: "Trening",
      url: "#",
      icon: Dumbbell,
    },
    {
      title: "Profil",
      url: "#",
      icon: UserCircle,
    },
  ],
  navSecondary: [],
};

// Rozszerzenie typu props o userData
export function AppSidebar({
  userData,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userData: UserData }) {
  return (
    <Sidebar
      className="text-2xl top-16 h-[calc(97vh-4.5rem)] mt-4 border-1 border-gray-100 rounded-md bg-white dark:bg-sidebar dark:border-slate-800 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] dark:shadow-background"
      {...props}
    >
      <SidebarContent className="p-0 mt-4 text-2xl">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-8" isPremium={false} />
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-slate-800">
        <NavUser userData={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}