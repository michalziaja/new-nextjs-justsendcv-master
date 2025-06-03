"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { getOrCreateKanbanBoard } from "../kanban/services/kanbanService"
import { Task, TaskPriority, TaskStatus } from "../kanban/types"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function CalendarSection() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true)
        const board = await getOrCreateKanbanBoard()
        
        // Zbieramy wszystkie zadania i dodajemy je do jednej tablicy
        const allTasks = Object.values(board.tasks)
        
        // Filtrujemy - tylko zadania, które NIE są ukończone
        const notCompletedTasks = allTasks.filter(task => task.status !== "done")
        
        // Sortujemy po dacie utworzenia - od najnowszych
        const sortedTasks = notCompletedTasks.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        // Bierzemy tylko 3 najnowsze zadania
        setTasks(sortedTasks.slice(0, 3))
      } catch (err) {
        console.error("Błąd podczas ładowania zadań:", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          error: err
        })
        setError("Nie udało się załadować zadań")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTasks()
  }, [])

  // Funkcja do formatowania daty
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "HH:mm, dd MMM", { locale: pl })
    } catch (e) {
      return dateString
    }
  }
  
  // Funkcja pomocnicza do określania koloru kropki priorytetu
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 border-red-700"
      case "medium":
        return "bg-blue-500 border-blue-700"
      case "low":
        return "bg-green-500 border-green-700"
      default:
        return "bg-blue-500 border-blue-700"
    }
  }
  
  // Funkcja pomocnicza aby opis priorytetu był po polsku
  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "Wysoki"
      case "medium":
        return "Średni"
      case "low":
        return "Niski"
      default:
        return "Średni"
    }
  }
  
  // Funkcja do określania koloru tła statusu
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 dark:border-blue-700"
      case "in-progress":
        return "bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 dark:border-amber-700"
      case "review":
        return "bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500 dark:border-purple-700"
      case "waiting":
        return "bg-cyan-50 dark:bg-cyan-950/30 border-l-4 border-cyan-500 dark:border-cyan-700"
      case "done":
        return "bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 dark:border-green-700"
      default:
        return "bg-gray-50 dark:bg-gray-800/30 border-l-4 border-gray-500 dark:border-gray-700"
    }
  }

  return (
    <Card className="h-full rounded-sm border-1 border-gray-300 dark:border-gray-800
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)] 
      dark:shadow-slate-900/20
      bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-[#00B2FF] stroke-2 transform transition-transform hover:scale-110" />
          <CardTitle>Zadania do wykonania</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800 dark:border-gray-200"></div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="text-sm text-muted-foreground">Brak zadań do wyświetlenia</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link 
                key={task.id} 
                href={`/scheduler?task=${task.id}`}
                className="block"
              >
                <div 
                  className={cn(
                    "flex justify-between items-start p-2 rounded-md cursor-pointer transition-colors hover:brightness-95 dark:hover:brightness-125", 
                    getStatusColor(task.status)
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className={cn("h-3 w-3 rounded-full border", getPriorityColor(task.priority))} 
                        title={`Priorytet: ${getPriorityLabel(task.priority)}`}
                      />
                      <p className="font-medium text-sm">{task.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-5">
                      {task.status === "todo" ? "Do zrobienia" : 
                       task.status === "in-progress" ? "W trakcie" : 
                       task.status === "review" ? "Weryfikacja" :
                       task.status === "waiting" ? "Oczekiwanie" : "Ukończone"}
                    </p>
                  </div>
                  <div className="text-xs font-medium whitespace-nowrap ml-2">
                    {formatDate(task.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 