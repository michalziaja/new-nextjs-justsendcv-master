"use client";

import * as React from "react";
import { type LucideIcon, ChevronRight, Download, Crown } from "lucide-react";
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

const browsers = [
  { name: "Chrome", url: "#" },
  { name: "Firefox", url: "#" },
  { name: "Edge", url: "#" },
  { name: "Safari", url: "#" },
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
        <SidebarMenu className="mt-8">
          {/* Baner subskrypcji */}
          <SidebarMenuItem className="mt-auto pt-8">
            <a
              href={userData.isSubscribed ? "/subscription" : "/upgrade"}
              className={`flex w-full items-center gap-2 rounded-lg p-3 text-white hover:opacity-90 transition-opacity text-xs ${
                userData.isSubscribed 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                  : "bg-gradient-to-r from-violet-500 to-purple-500"
              }`}
            >
              <Crown className="h-6 w-6" />
              <span className="font-medium">
                {userData.isSubscribed ? "Używasz Premium" : "Przejdź na Premium"}
              </span>
            </a>
          </SidebarMenuItem>
          
          
          
          {/* Baner wtyczek */}
          <SidebarMenuItem className="mb-2 pt-8">
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-100 dark:bg-slate-800 p-3 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-xs">
                <div className="flex items-center gap-2">
                  <Download className="h-6 w-6" />
                  <span className="font-medium">Pobierz wtyczkę</span>
                </div>
                <ChevronRight className="h-5 w-5 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-1">
                  {browsers.map((browser) => (
                    <a
                      key={browser.name}
                      href={browser.url}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-md hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      {browser.name}
                    </a>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

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