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
                  <div className="relative w-full">
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title}
                    >
                      <Link 
                        href={item.url}
                        className="w-full flex items-center gap-6 px-6 py-4 rounded-md bg-transparent hover:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:active:bg-transparent shadow-[5px_5px_5px_rgba(0,0,0,0.3)] dark:shadow-xs border-1 dark:border-2 border-gray-400/50 dark:border-cyan-500/80"
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
                      className="w-full flex items-center gap-6 px-6 py-4 rounded-md bg-transparent hover:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:active:bg-transparent transition-transform duration-200 hover:scale-[1.08]"
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
