"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, CheckSquare, ClipboardList, FileText, ListChecks, Mail, MessageSquare, PhoneCall, Send, X } from "lucide-react"
import { StatCards } from "@/components/dashboard/stat-cards"
import { RecentJobs } from "@/components/dashboard/recent-jobs"
import { Checklist } from "@/components/dashboard/checklist"
import { NewsSection } from "@/components/dashboard/news-section"
import { CalendarSection } from "@/components/dashboard/calendar-section"
import { WeeklyGoals } from "@/components/dashboard/weekly-goals"

export const iframeHeight = "800px"

export const description = "Dashboard strony głównej JustSend.cv"

export default function Dashboard() {
  return (
    <div className="[--header-height:calc(--spacing(14))] bg-background">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-2 transition-all duration-200">
              {/* Rząd 1: Statystyki */}
              <div className="ml-0 mr-0 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
              lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-8 xl:mr-8 xl:mt-10">
                <StatCards />
              </div>

              {/* Rząd 2: Ostatnie oferty i cele tygodniowe */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-3
              ml-0 mr-0 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6  
              lg:ml-8 lg:mr-6 xl:ml-8 xl:mr-8">
                <div className="lg:col-span-2 h-full">
                  <RecentJobs />
                </div>
                <div className="lg:col-span-1 h-full">
                  <WeeklyGoals />
                </div>
              </div>

              {/* Rząd 3: Aktualności, Kalendarz, Checklista */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3
              ml-0 mr-0 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6  
              lg:ml-8 lg:mr-6 xl:ml-8 xl:mr-8">
                
                <NewsSection />
                <Checklist />
                <CalendarSection />
                
              </div>

              
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

// // Komponent karty statystyk
// interface StatCardProps {
//   title: string;
//   value: string;
//   description: string;
//   icon: React.ReactNode;
// }

// function StatCard({ title, value, description, icon }: StatCardProps) {
//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">{title}</CardTitle>
//         {icon}
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold">{value}</div>
//         <p className="text-xs text-muted-foreground">{description}</p>
//       </CardContent>
//     </Card>
//   )
// }
