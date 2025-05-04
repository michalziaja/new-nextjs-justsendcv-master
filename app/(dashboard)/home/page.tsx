// app/(dashboard)/page.tsx
"use client"
import { StatCards } from "@/components/home/stat-cards"
import { RecentJobs } from "@/components/home/recent-jobs"
import { Checklist } from "@/components/home/checklist"
import { NewsSection } from "@/components/home/news-section"
import { CalendarSection } from "@/components/home/calendar-section"
import { WeeklyGoals } from "@/components/home/weekly-goals"

export const iframeHeight = "800px"
export const description = "Dashboard strony głównej JustSend.cv"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-2 p-2 transition-all duration-200">
      {/* Rząd 1: Statystyki */}
      <div className="mb-14 ml-2 mr-2 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
      lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-15 xl:mr-15 xl:mt-12">
        <StatCards />
      </div>

      {/* Rząd 2: Ostatnie oferty i cele tygodniowe */}
      <div className="grid gap-2 grid-cols-1 lg:grid-cols-3
      ml-2 mr-2 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6  
      lg:ml-8 lg:mr-6 xl:ml-15 xl:mr-15">
        <div className="lg:col-span-2 h-full">
          <RecentJobs />
        </div>
        <div className="lg:col-span-1 h-full">
          <WeeklyGoals />
        </div>
      </div>

      {/* Rząd 3: Aktualności, Kalendarz, Checklista */}
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3
      ml-2 mr-2 sm:ml-2 sm:mr-2 md:ml-6 md:mr-6  
      lg:ml-8 lg:mr-6 xl:ml-15 xl:mr-15">
        <NewsSection />
        <CalendarSection />
        <Checklist />
      </div>
    </div>
  )
}
