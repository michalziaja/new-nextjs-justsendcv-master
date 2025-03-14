"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CalendarDays, Plus, KanbanSquare } from "lucide-react"
import { CalendarTab } from "@/components/calendar/calendar-tab"
import { KanbanTab } from "@/components/calendar/kanban-tab"

export const iframeHeight = "800px"

export const description = "Terminarz z widokiem Kanban i kalendarzem"

export default function Calendar() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-6 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Terminarz</h1>
                  <p className="text-muted-foreground">
                    Zarządzaj swoimi zadaniami i wydarzeniami
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nowe wydarzenie
                </Button>
              </div>
              
              <Tabs defaultValue="kanban" className="w-full">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <KanbanSquare className="h-4 w-4" />
                    Tablica Kanban
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Kalendarz
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="kanban">
                  <KanbanTab />
                </TabsContent>
                
                <TabsContent value="calendar">
                  <CalendarTab />
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}