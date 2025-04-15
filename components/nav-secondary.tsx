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
          <SidebarMenuItem className="mt-auto pt-20">
            {!userData.isSubscribed ? (
              <a
                href="/upgrade"
                className="flex w-full items-center gap-2 rounded-lg p-3 hover:scale-103 text-white hover:opacity-90 transition-opacity text-xs shadow-[5px_5px_5px_rgba(0,0,0,0.3)] dark:shadow-xs bg-gradient-to-r from-violet-500 to-purple-500"
              >
                <Crown className="h-6 w-6" />
                <span className="font-medium">Przejdź na Premium</span>
              </a>
            ) : (
              <div className="flex w-full items-center gap-2 rounded-md p-3 text-white text-xs shadow-sm dark:shadow-xs bg-gradient-to-r from-green-500 to-emerald-500">
                <Crown className="h-6 w-6" />
                <span className="font-medium">Używasz Premium</span>
              </div>
            )}
          </SidebarMenuItem>
          
          
          
          {/* Baner wtyczek */}
          <SidebarMenuItem className="mb-2 pt-6">
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:bg-transparent p-3 hover:bg-gray-50 hover:scale-103 dark:hover:bg-slate-700 transition-colors text-xs shadow-md dark:shadow-xs">
                <div className="flex items-center gap-2">
                  <Download className="h-6 w-6" />
                  <span className="font-medium">Pobierz wtyczkę</span>
                </div>
                <ChevronDown className="h-5 w-5 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 ml-2 mr-2 space-y-1 border-2 bg-transparent dark:bg-transparent border-gray-300/50 dark:border-slate-700/50 rounded-lg p-2">
                  {browsers.map((browser) => (
                    <a
                      key={browser.name}
                      href={browser.url}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-md hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <browser.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
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