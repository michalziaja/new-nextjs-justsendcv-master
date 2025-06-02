"use client"

import { useState, useDeferredValue } from "react"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { CalendarIcon, Kanban, Search } from "lucide-react"
// import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  // Stan dla kontrolowania ramki wskazówek
  const [isHelpExpanded, setIsHelpExpanded] = useState(false)

  return (
    <div className="flex flex-1 flex-col p-2 
            ml-0 mr-0 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
            lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-15 xl:mr-15 xl:mt-12">
      
      {/* Ramka ze wskazówkami */}
      <div className={`
        relative border border-blue-200 dark:border-blue-800 
        bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4
        transition-all duration-300 ease-in-out overflow-hidden
        ${isHelpExpanded ? 'min-h-[200px]' : 'h-[40px]'}
      `}>
        <Button
          variant="ghost"
          className="absolute top-1 right-1 h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-800/50"
          onClick={() => setIsHelpExpanded(!isHelpExpanded)}
        >
          {isHelpExpanded ? (
            <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </Button>
        
        <div className="p-3">
          <div className={`flex items-center gap-2 ${isHelpExpanded ? 'mb-2 justify-center' : 'justify-center h-4'}`}>
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Jak działa tablica Kanban
            </h3>
          </div>
          
          {isHelpExpanded && (
            <div className="text-xs text-blue-700 dark:text-blue-300 animate-in fade-in duration-200">
              {/* Układ dwukolumnowy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0">
                {/* Lewa kolumna */}
                <div className="space-y-2">
                  {/* Podstawowe operacje */}
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">🔧 Podstawowe operacje</p>
                    <p>• <strong>Przeciąganie zadań:</strong> Uchwyć zadanie i przeciągnij między kolumnami aby zmienić status</p>
                    <p>• <strong>Kolejność kolumn:</strong> Przeciągnij kolumny za ikonę ⋮ aby zmienić ich kolejność</p>
                    <p>• <strong>Dodawanie zadań:</strong> Kliknij "Dodaj zadanie" w dowolnej kolumnie</p>
                    <p>• <strong>Edycja zadań:</strong> Kliknij ikonę ołówka lub bezpośrednio na zadanie aby edytować</p>
                  </div>

                  {/* Priorytety zadań */}
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">⭕ Priorytety zadań</p>
                    <p>• 🔴 <strong>Wysoki priorytet</strong> - pilne zadania wymagające natychmiastowej uwagi</p>
                    <p>• 🔵 <strong>Średni priorytet</strong> - standardowe zadania (domyślny)</p>
                    <p>• 🟢 <strong>Niski priorytet</strong> - zadania do wykonania w wolnym czasie</p>
                  </div>
                </div>

                {/* Prawa kolumna */}
                <div className="space-y-2">
                  {/* Zarządzanie kolumnami */}
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">📋 Zarządzanie kolumnami</p>
                    <p>• <strong>Dodawanie kolumn:</strong> Możesz dodać maksymalnie 5 kolumn (przycisk "Dodaj kolumnę")</p>
                    <p>• <strong>Edycja tytułów:</strong> Kliknij na tytuł kolumny aby go zmienić</p>
                    <p>• <strong>Usuwanie kolumn:</strong> Dostępne tylko dla dodatkowych kolumn (nie podstawowych)</p>
                  </div>

                  {/* Funkcje zaawansowane */}
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">⚙️ Funkcje zaawansowane</p>
                    <p>• <strong>Automatyczny zapis:</strong> Wszystkie zmiany są automatycznie synchronizowane</p>
                    <p>• <strong>Daty wykonania:</strong> Ustaw terminy dla swoich zadań</p>
                    <p>• <strong>Opisy zadań:</strong> Dodaj szczegółowe opisy do zadań</p>
                    <p>• <strong>Liczniki zadań:</strong> Każda kolumna pokazuje liczbę zadań</p>
                    <p>• <strong>Responsywny design:</strong> Działa na wszystkich urządzeniach</p>
                  </div>
                </div>
              </div>

              {/* Wskazówka na całej szerokości */}
              <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded border-l-4 border-blue-400 mt-3">
                <p className="text-xs">💡 <strong>Wskazówka:</strong> Tablica Kanban jest automatycznie tworzona przy pierwszym użyciu i zapisuje wszystkie zmiany w czasie rzeczywistym. Zadania można przeciągać zarówno w obrębie kolumny (zmiana kolejności) jak i między kolumnami (zmiana statusu).</p>
              </div>
            </div>
          )}
        </div>
      </div>

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

        <div className="mt-0 px-0">
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
