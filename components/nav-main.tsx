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
                        className="w-full flex items-center gap-4 px-6 py-3 rounded-sm  bg-gradient-to-tr from-[#3879DA] to-[#24D1DA]  text-white shadow-sm hover:opacity-95"
                      >
                        <item.icon className="w-8 h-8 text-white" />
                        <span className="text-white text-base font-medium">{item.title}</span>
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
                      className="w-full flex items-center gap-4 px-6 py-3 rounded-md hover:bg-gray-50 transition-all duration-200 hover:scale-[1.03]"
                    >
                      <item.icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                      <span className="text-slate-800 dark:text-slate-200 text-base font-medium">{item.title}</span>
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
                                className="text-slate-700 dark:text-slate-300 hover:text-[#15d8e5] dark:hover:text-[#15d8e5] transition-colors duration-200"
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
