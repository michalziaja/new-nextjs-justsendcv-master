"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"


import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string 
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu className="text-2xl">
        {items.map((item) => {
          const isActive = pathname === item.url
          return (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem className="flex justify-center w-full">
              {isActive ? (
                <div className="relative w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg">
           
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    className={`relative hover:bg-white hover:text-cyan-600 dark:hover:bg-slate-900 dark:hover:text-cyan-400 text-lg gap-6 font-medium py-4 w-full rounded-md ${isActive ? 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 text-cyan-600 dark:text-cyan-400' : ''}`}
                  >
                    <a href={item.url} className="w-full flex items-center gap-6 pl-6">
                      <item.icon className="w-7 h-7" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </div>
              ) : (
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  className={`hover:bg-white hover:text-cyan-600 dark:hover:bg-slate-900 dark:hover:text-cyan-400 transition-colors duration-200 text-lg gap-6 font-medium py-4 w-full rounded-md hover:scale-105`}
                >
                  <a href={item.url} className="w-full flex items-center gap-6 pl-6">
                    <item.icon className="w-7 h-7" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200"
                          >
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        )})}
      </SidebarMenu>
    </SidebarGroup>
  )
}
