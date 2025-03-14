"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { GlowEffect } from '@/components/motion-primitives/glow-effect'

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
                <div className="relative w-full">
                  <GlowEffect
                    colors={['#1E88E5', '#26C6DA']}
                    mode='static'
                    blur="soft"
                    duration={3}
                    scale={1}
                  />
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    className={`relative hover:bg-gray-100 dark:hover:bg-slate-800 text-lg gap-6 font-medium py-4 w-full rounded-md ${isActive ? 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800' : ''}`}
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
                  className={`hover:bg-gray-100 dark:hover:bg-slate-800 text-lg gap-6 font-medium py-4 w-full rounded-md`}
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
                          <SidebarMenuSubButton asChild>
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
