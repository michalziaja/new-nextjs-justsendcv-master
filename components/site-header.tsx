"use client"

import { PanelLeftClose, PanelLeftOpen, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notificationBell"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { toggleSidebar, open } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get current page name from pathname
  const getCurrentPageName = () => {
    switch (pathname) {
      case "/home":
        return "Home"
      case "/creator":
        return "Kreator CV"
      case "/saved":
        return "Zapisane"
      case "/scheduler":
        return "Terminarz"
      default:
        return "Home"
    }
  }

  // Common header layout to avoid duplication
  const headerContent = (
    <div className="flex h-14 w-full items-center justify-between px-4 ">
      <div className="flex items-center">
        {/* Logo jako przycisk zwijania menu */}
        <div 
          onClick={toggleSidebar}
          className="flex items-center gap-2 rounded-md p-1 cursor-pointer hover:scale-105 transition-all duration-300"
        >
          <div className={`flex aspect-square size-10 items-center justify-center transition-transform duration-500 ${open ? 'rotate-360' : ''}`}>
            <div className="relative w-full h-full">
              <Image
                src="/logo.png"
                alt="JustSend.cv"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-700 dark:text-gray-200">JustSend.cv</span>
          </div>
        </div>

        {/* Spacing before separator */}
        <div className="w-10" />
        
        {/* Separator */}
        <div className="hidden md:flex h-8 items-center">
          <Separator orientation="vertical" />
        </div>
        
        {/* Spacing after separator */}
        <div className="w-4" />
        
        {/* Breadcrumb */}
        <Breadcrumb className="hidden md:block whitespace-nowrap">
          <BreadcrumbList className="flex items-center">
            {/* <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-sm">
                JustSend.cv
              </BreadcrumbLink>
            </BreadcrumbItem> */}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm">{getCurrentPageName()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Theme toggle */}
      <div className="flex items-center gap-2 mr-2">
        <NotificationBell />
        <ThemeToggle />
      </div>
    </div>
  )

  return (
    <header className="bg-white sticky top-2.5 z-50 flex w-[calc(100%-1rem)] border-1 border-gray-100 mx-auto items-center rounded-md shadow-[2px_4px_10px_rgba(0,0,0,0.3)] dark:shadow-[2px_4px_10px_rgba(0,0,1,0.3)] dark:bg-slate-900 dark:border-slate-800 ">
      {headerContent}
    </header>
  )
}