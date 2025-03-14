"use client"

import * as React from "react"
import Image from "next/image"
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
} from "lucide-react"
import homeIcon from "@/public/ikony/home.png"
import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
    }
  ],
  navSecondary: [],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
    className="text-2xl top-16 h-[calc(97vh-4.5rem)] mt-4 border-2 border-gray-300 rounded-md shadow-[3px_6px_15px_rgba(1,0,0,0.3)] bg-gray-50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-[3px_3px_10px_rgba(255,255,255,0.2)]"      {...props}
    >
      <SidebarContent className="p-0 mt-4 text-2xl">
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-8" isPremium={false} />
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-slate-800">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
