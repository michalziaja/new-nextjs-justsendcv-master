// components/nav-main.tsx
"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

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
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url
          return (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                {isActive ? (
                  <div className="relative w-full border-2 border-cyan-500 dark:border-cyan-600 rounded-md">
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title}
                    >
                      <Link 
                        href={item.url}
                        className="w-full flex items-center gap-6 px-6 py-4 rounded-[3px] bg-transparent dark:bg-transparent"
                      >
                        <item.icon className="w-7 h-7 text-slate-700 dark:text-slate-200" />
                        <span className="text-slate-800 dark:text-slate-200 text-lg font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </div>
                ) : (
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                  >
                    <Link
                      href={item.url}
                      className="w-full flex items-center gap-6 px-6 py-4 rounded-md border-2 border-transparent hover:border-slate-300 hover:bg-transparent dark:hover:border-slate-700 dark:hover:bg-transparent transition-all duration-200 hover:scale-105 transform"
                    >
                      <item.icon className="w-7 h-7 text-slate-700 dark:text-slate-200" />
                      <span className="text-slate-800 dark:text-slate-200 text-lg font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Rozwiń</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={subItem.url}
                                className="text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-500 transition-colors duration-200"
                              >
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
