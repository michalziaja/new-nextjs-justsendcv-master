"use client"

import { KanbanColumn } from "@/components/calendar/kanban-column"

export function KanbanTab() {
  // Dummy data dla tablicy Kanban
  const kanbanData = {
    toDo: {
      title: "Do zrobienia",
      count: 3,
      variant: "default" as const,
      tasks: [
        { title: "Przygotować CV", description: "Aktualizacja CV z nowymi projektami", date: "15 Lip", priority: "Wysoki" },
        { title: "Napisać list motywacyjny", description: "Do aplikacji w XYZ Corp", date: "17 Lip", priority: "Średni" },
        { title: "Przygotować portfolio", description: "Zebrać przykłady prac", date: "20 Lip", priority: "Niski" }
      ]
    },
    inProgress: {
      title: "W trakcie",
      count: 2,
      variant: "blue" as const,
      tasks: [
        { title: "Rozmowa kwalifikacyjna", description: "Przygotowanie do rozmowy w ABC Inc", date: "Dziś", priority: "Wysoki" },
        { title: "Kurs React", description: "Ukończyć moduł 5 i 6", date: "15 Lip", priority: "Średni" }
      ]
    },
    done: {
      title: "Ukończone",
      count: 2,
      variant: "green" as const,
      tasks: [
        { title: "Aplikacja wysłana", description: "Do Software Solutions", date: "10 Lip", priority: "Wysoki" },
        { title: "Test kwalifikacyjny", description: "Test z programowania", date: "5 Lip", priority: "Wysoki" }
      ]
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KanbanColumn
        title={kanbanData.toDo.title}
        count={kanbanData.toDo.count}
        variant={kanbanData.toDo.variant}
        tasks={kanbanData.toDo.tasks}
      />
      <KanbanColumn
        title={kanbanData.inProgress.title}
        count={kanbanData.inProgress.count}
        variant={kanbanData.inProgress.variant}
        tasks={kanbanData.inProgress.tasks}
      />
      <KanbanColumn
        title={kanbanData.done.title}
        count={kanbanData.done.count}
        variant={kanbanData.done.variant}
        tasks={kanbanData.done.tasks}
      />
    </div>
  )
}