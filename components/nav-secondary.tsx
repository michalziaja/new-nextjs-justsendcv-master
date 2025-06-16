"use client";

import * as React from "react";
import { type LucideIcon, ChevronRight, Download, Crown, ChevronDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaFirefox, FaEdge, FaSafari, FaChrome } from "react-icons/fa";




const browsers = [
  { name: "Chrome", url: "#", icon: FaChrome },
  { name: "Firefox", url: "#", icon: FaFirefox },
  { name: "Edge", url: "#", icon: FaEdge },
  { name: "Safari", url: "#", icon: FaSafari },
];

// Definicja typu UserData z isSubscribed
type UserData = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isSubscribed: boolean;
};

export function NavSecondary({
  items,
  userData,
  ...props
}: {
  items: { title: string; url: string; icon: LucideIcon }[];
  userData: UserData;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu className="mt-auto">
          {/* Baner subskrypcji */}
          <SidebarMenuItem className="mt-auto">
            {!userData.isSubscribed ? (
              <a
                href="/upgrade"
                className="flex h-10 -ml-1 w-[105.5%] items-center gap-2 rounded-sm shadow-sm p-2 hover:scale-103 text-white hover:opacity-90 transition-opacity text-xs  dark:shadow-xs bg-gradient-to-r from-violet-500 to-purple-500"
              >
                <Crown className="h-6 w-6 ml-2" />
                <span className="font-medium">Przejdź na Premium</span>
              </a>
            ) : (
              <div className="flex -ml-1 px-5 items-center gap-2 w-[105.5%] rounded-sm p-2 text-white text-xs hover:scale-103 shadow-sm dark:shadow-xs bg-gradient-to-r from-green-500 to-emerald-500">
                <Crown className="h-6 w-6" />
                <span className="font-medium">Używasz Premium</span>
              </div>
            )}
          </SidebarMenuItem>
          
          
          
          {/* Baner wtyczek */}
          
          {/* Standardowe elementy menu */}
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm" className="text-xl py-3">
                <a href={item.url}>
                  <item.icon className="h-7 w-7" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}