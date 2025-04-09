// Typy dla komponentów Kanban i Kalendarz
import { UniqueIdentifier } from "@dnd-kit/core"

// Priorytety zadań
export type TaskPriority = "low" | "medium" | "high"

// Status zadań dla tablicy Kanban
export type TaskStatus = "todo" | "in-progress" | "done" | "review" | "waiting"

// Typ podstawowego zadania
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  tags: string[]
  assignedTo?: string
  createdAt: string
  isNew?: boolean
  isTemp?: boolean
  cancelTemp?: boolean
}

// Typ kolumny Kanban
export interface Column {
  id: TaskStatus
  title: string
  taskIds: string[]
}

// Typ dla stanu tablicy Kanban
export interface KanbanBoard {
  tasks: Record<string, Task>
  columns: Record<string, Column>
  columnOrder: TaskStatus[]
}

// Typ dla wydarzeń kalendarza
export interface CalendarEvent extends Task {
  startDate: Date | string
  endDate?: Date | string
}

// Typy dla DnD - używamy typów bezpośrednio z biblioteki dnd-kit
// zamiast definiować własne typy, które kolidują
import type { DragEndEvent as DndKitDragEndEvent } from "@dnd-kit/core"
export type { DndKitDragEndEvent as DragEndEvent } 