"use client"

import { useState, useDeferredValue } from "react"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { CalendarIcon, Kanban, Search } from "lucide-react"
// import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"

// Dynamiczny import komponentu KanbanBoard bez SSR
const KanbanBoard = dynamic(
  () => import("@/components/kanban/KanbanBoard"),
  { ssr: false }
)

// Dynamiczny import komponentu CalendarTab bez SSR
// const CalendarTab = dynamic(
//   () => import("@/components/calendar/calendar-tab").then(mod => mod.CalendarTab),
//   { ssr: false }
// )

export default function SchedulerPage() {
  // Zakładki są teraz zakomentowane, ale zachowuję stan 'kanban' na wypadek przyszłych zmian
  const [activeTab] = useState<string>("kanban")
  // const [searchQuery, setSearchQuery] = useState<string>("")
  // Używamy pustego stringa zamiast deferredValue
  const deferredSearchQuery = ""

  return (
    <div className="flex flex-1 flex-col p-2 
            ml-0 mr-0 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
            lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-15 xl:mr-15 xl:mt-12">
      
        {/* Wyszukiwarka i zakładki są teraz zakomentowane */}
        {/* <div className="flex items-center justify-between w-full gap-4 mt-0">
          <div className="relative w-45 sm:w-50 md:w-50 lg:w-50 xl:w-57 ml-0 border-0 bg-white dark:bg-sidebar shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border-cyan-500 dark:border-gray-700 rounded-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground " />
            <Input
              placeholder="Wyszukaj zadania..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs md:text-sm lg:text-sm xl:text-sm"
            />
          </div>
          
          <Tabs defaultValue="kanban" value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
            <TabsList className="grid grid-cols-2 gap-1 max-w-[230px] bg-transparent p-1">
              <TabsTrigger 
                value="kanban" 
                className="flex items-center h-8 gap-2 border-1 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-950 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-[2px_4px_10px_rgba(0,0,0,0.3)] transition-all"
              >
                <Kanban className="h-4 w-4" />
                <span>Kanban</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex items-center h-8 gap-2 border-1 border-gray-300 dark:border-gray-700 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-[2px_4px_10px_rgba(0,0,0,0.3)] transition-all"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Kalendarz</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div> */}

        <div className="mt-2 px-0">
          {/* Zawsze wyświetlamy tablicę Kanban, niezależnie od activeTab */}
          <div className="p-0">
            {/* Używamy client-only renderingu z pustym query */}
            <KanbanBoard searchQuery={deferredSearchQuery} />
          </div>
          
          {/* Kalendarz jest zakomentowany */}
          {/* {activeTab === "calendar" && (
            <div className="p-0">
              <CalendarTab />
            </div>
          )} */}
        </div>
      
    </div>
  )
}
