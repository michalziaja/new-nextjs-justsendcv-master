// app/saved/page.tsx
"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SavedTable } from "@/components/saved/SavedTable"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import UserInitializer from "@/components/UserInitializer"


export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function Saved() {
  return (
    
            <div className="flex flex-1 flex-col p-2 
              ml-0 mr-0 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
              lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-8 xl:mr-8 xl:mt-10">
              <SavedTable />
            </div>
            
  )
}