"use client"

import React, { useState, useMemo, useId } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanbanBoard as KanbanBoardType, Task, TaskStatus, Column } from "./types"
import KanbanColumn from "./KanbanColumn"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import KanbanTask from "./KanbanTask"
import { v4 as uuidv4 } from "uuid"
import { getColumnHeaderColor } from "./utils"

// Dane przykładowe dla tablicy Kanban
const initialTasks: Record<string, Task> = {
  "task-1": {
    id: "task-1",
    title: "Przygotować CV do PwC",
    description: "Dostosować CV do wymagań oferty na stanowisko Analityka Finansowego",
    priority: "high",
    status: "todo",
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["CV", "Finanse"],
  },
  "task-2": {
    id: "task-2",
    title: "Wysłać aplikację do McKinsey",
    description: "Przesłać CV i list motywacyjny na stanowisko konsultanta",
    priority: "medium",
    status: "in-progress",
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Konsulting"],
  },
  "task-3": {
    id: "task-3",
    title: "Przygotować się do rozmowy z Deloitte",
    description: "Przejrzeć typowe pytania rekrutacyjne i przećwiczyć odpowiedzi",
    priority: "high",
    status: "in-progress",
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Rozmowa", "Przygotowanie"],
  },
  "task-4": {
    id: "task-4",
    title: "Aktualizacja LinkedIn",
    description: "Dodać nowe umiejętności i doświadczenia do profilu",
    priority: "low",
    status: "todo",
    createdAt: new Date().toISOString(),
    tags: ["Social Media"],
  },
  "task-5": {
    id: "task-5",
    title: "Uzupełnić profil na GoldenLine",
    description: "Zaktualizować informacje zawodowe i certyfikaty",
    priority: "low",
    status: "done",
    createdAt: new Date().toISOString(),
    tags: ["Social Media"],
  },
}

// Zdefiniowanie 3 podstawowych kolumn
const initialColumns: Record<string, Column> = {
  todo: {
    id: "todo",
    title: "Do zrobienia",
    taskIds: ["task-1", "task-4"],
  },
  "in-progress": {
    id: "in-progress",
    title: "W trakcie",
    taskIds: ["task-2", "task-3"],
  },
  done: {
    id: "done",
    title: "Ukończone",
    taskIds: ["task-5"],
  },
}

// Kolejność kolumn
const initialColumnOrder: TaskStatus[] = ["todo", "in-progress", "done"]

interface KanbanBoardProps {
  searchQuery?: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ searchQuery = "" }) => {
  // Stan tablicy Kanban
  const [boardData, setBoardData] = useState<KanbanBoardType>({
  tasks: initialTasks,
  columns: initialColumns,
  columnOrder: initialColumnOrder,
  })
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  
  // Konfiguracja sensorów dla DnD (określa jak użytkownik może rozpocząć przeciąganie)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimalna odległość w px, którą musi przesunąć wskaźnik, aby rozpocząć przeciąganie
      },
    })
  )
  
  // Funkcja do filtrowania zadań na podstawie wyszukiwania
  const filterTasks = useMemo(() => {
    if (!searchQuery.trim()) return boardData.tasks
    
    const filteredTasks: Record<string, Task> = {}
    Object.entries(boardData.tasks).forEach(([id, task]) => {
      const matchesTitle = task.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDescription = task.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      if (matchesTitle || matchesDescription || matchesTags) {
        filteredTasks[id] = task
      }
    })
    
    return filteredTasks
  }, [boardData.tasks, searchQuery])
  
  // Filtrowane zadania
  const filteredTasks = filterTasks
  
  // Dodajemy nowy stan dla tymczasowych zadań
  const [tempTasks, setTempTasks] = useState<Record<string, Task>>({})

  // Funkcja do dodawania nowego zadania - teraz tworzy tylko tymczasowe zadanie
  const handleAddTask = (columnId: TaskStatus) => {
    const newTaskId = `temp-${uuidv4()}`
    const tempTask: Task = {
      id: newTaskId,
      title: `Nowe zadanie`,
      description: "Kliknij, aby edytować opis zadania",
      status: columnId,
      priority: "medium",
      createdAt: new Date().toISOString(),
      tags: [],
      isNew: true,
      isTemp: true // Oznaczenie, że to tymczasowe zadanie
    }
    
    // Dodajemy tymczasowe zadanie
    setTempTasks(prev => ({
      ...prev,
      [newTaskId]: tempTask
    }))
  }

  // Funkcja do zapisywania tymczasowego zadania do właściwego stanu
  const handleSaveTempTask = (taskId: string, updatedTask: Partial<Task>) => {
    const tempTask = tempTasks[taskId]
    if (!tempTask) return
    
    // Sprawdzamy, czy zadanie ma tytuł - jeśli nie, nie zapisujemy go
    if (!updatedTask.title?.trim()) {
      handleCancelTempTask(taskId)
      return
    }
    
    // Tworzymy nowe prawdziwe zadanie z danymi z tymczasowego
    const newTaskId = `task-${uuidv4()}`
    const newTask: Task = {
      ...tempTask,
      ...updatedTask,
      id: newTaskId,
      isTemp: false,
      isNew: false
    }
    
    // Dodajemy zadanie do stanu tablicy
    setBoardData(prev => {
      const updatedColumns = { ...prev.columns }
      updatedColumns[tempTask.status].taskIds.push(newTaskId)
      
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [newTaskId]: newTask
        },
        columns: updatedColumns
      }
    })
    
    // Usuwamy tymczasowe zadanie
    setTempTasks(prev => {
      const { [taskId]: removed, ...rest } = prev
      return rest
    })
  }

  // Funkcja do anulowania tworzenia tymczasowego zadania
  const handleCancelTempTask = (taskId: string) => {
    setTempTasks(prev => {
      const { [taskId]: removed, ...rest } = prev
      return rest
    })
  }

  // Funkcja do edycji zadania
  const handleEditTask = (taskId: string, updatedTask: Partial<Task>) => {
    // Sprawdzamy, czy to tymczasowe zadanie
    if (taskId.startsWith('temp-')) {
      // Jeśli jest flaga anulowania, po prostu usuwamy zadanie
      if (updatedTask.cancelTemp) {
        handleCancelTempTask(taskId)
        return
      }
      
      handleSaveTempTask(taskId, updatedTask)
      return
    }
    
    // Normalna edycja istniejącego zadania
    setBoardData(prev => {
      const task = prev.tasks[taskId]
      if (!task) return prev
      
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...task,
            ...updatedTask
          }
        }
      }
    })
  }
  
  // Funkcja do dodawania nowej kolumny
  const handleAddColumn = () => {
    // Maksymalna liczba kolumn to 5
    if (boardData.columnOrder.length >= 5) return
    
    // Ustalenie ID nowej kolumny
    let newColumnId: TaskStatus
    let title: string
    
    if (!boardData.columns["review"]) {
      newColumnId = "review"
      title = "Weryfikacja"
    } else {
      newColumnId = "waiting"
      title = "Oczekiwanie"
    }
    
    // Aktualizacja stanu tablicy
    setBoardData(prev => {
      const updatedColumns = {
        ...prev.columns,
        [newColumnId]: {
          id: newColumnId,
          title,
          taskIds: []
        }
      }
      
      // Dodanie nowej kolumny na przedostatniej pozycji (przed "Ukończone")
      const updatedColumnOrder = [...prev.columnOrder]
      const doneIndex = updatedColumnOrder.indexOf("done")
      updatedColumnOrder.splice(doneIndex, 0, newColumnId)
      
      return {
        ...prev,
        columns: updatedColumns,
        columnOrder: updatedColumnOrder
      }
    })
  }

  // Funkcja do usuwania kolumny
  const handleRemoveColumn = (columnId: TaskStatus) => {
    // Nie można usunąć podstawowych kolumn
    if (columnId === "todo" || columnId === "in-progress" || columnId === "done") return
    
    setBoardData(prev => {
      const column = prev.columns[columnId]
      const updatedTasks = { ...prev.tasks }
      const updatedColumns = { ...prev.columns }
      const updatedColumnOrder = prev.columnOrder.filter(id => id !== columnId)
      
      // Przenosimy wszystkie zadania z usuwanej kolumny do kolumny "Do zrobienia"
      column.taskIds.forEach(taskId => {
        if (updatedTasks[taskId]) {
          updatedTasks[taskId] = {
            ...updatedTasks[taskId],
            status: "todo"
          }
          // Dodaj zadanie do kolumny "Do zrobienia"
          updatedColumns.todo.taskIds.push(taskId)
        }
      })
      
      // Usuń kolumnę
      delete updatedColumns[columnId]
      
      return {
        ...prev,
        tasks: updatedTasks,
        columns: updatedColumns,
        columnOrder: updatedColumnOrder
      }
    })
  }
  
  // Funkcja do edycji tytułu kolumny
  const handleEditColumnTitle = (columnId: TaskStatus, newTitle: string) => {
    setBoardData(prev => {
      const updatedColumns = { ...prev.columns }
      updatedColumns[columnId] = {
        ...updatedColumns[columnId],
        title: newTitle
      }
      
      return {
        ...prev,
        columns: updatedColumns
      }
    })
  }
  
  // Funkcja do usuwania zadania
  const handleDeleteTask = (taskId: string, columnId: TaskStatus) => {
    setBoardData(prev => {
      // Usunięcie zadania z listy zadań
      const { [taskId]: deletedTask, ...restTasks } = prev.tasks;
      
      // Usunięcie id zadania z kolumny
      const updatedColumns = { ...prev.columns };
      updatedColumns[columnId] = {
        ...updatedColumns[columnId],
        taskIds: updatedColumns[columnId].taskIds.filter(id => id !== taskId)
      }
      
      return {
        ...prev,
        tasks: restTasks,
        columns: updatedColumns
      }
    })
  }

  // Funkcja wywoływana przy rozpoczęciu przeciągania
  const handleDragStart = (event: any) => {
    const { active } = event
    const activeId = active.id.toString()
    
    if (active.data?.current?.type === 'task') {
      setActiveTask(boardData.tasks[activeId])
      setActiveColumn(null)
    } else if (active.data?.current?.type === 'column') {
      const column = boardData.columns[activeId as TaskStatus]
      if (column) {
        const columnTasks = column.taskIds
          .filter(taskId => filteredTasks[taskId])
          .map(taskId => boardData.tasks[taskId])
        
        setActiveTask(null)
        setActiveColumn({ column, tasks: columnTasks })
      }
    }
  }

  // Komponent kolumny w trybie przeciągania (dla DragOverlay)
  const DraggableColumn = ({ column, tasks }: { column: Column, tasks: Task[] }) => {
    return (
      <Card 
        className={`w-[300px] min-w-[210px] ${getColumnHeaderColor(column.id)} shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border rounded-lg opacity-95`}
      >
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
            </div>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 min-h-[200px]">
          {tasks.map((task) => (
            <div key={task.id} className="mb-2 p-3 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-sm font-medium">{task.title}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Liczba kolumn do określenia responsywności
  const columnCount = boardData.columnOrder.length
  const canAddColumn = columnCount < 5

  // Aktualnie przeciągana kolumna
  const [activeColumn, setActiveColumn] = useState<{ column: Column, tasks: Task[] } | null>(null)

  // Funkcja wywoływana po zakończeniu przeciągania
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    setActiveColumn(null)
    
    const { active, over } = event
    
    if (!over) return
    
    const activeId = active.id.toString()
    const overId = over.id.toString()
    
    // Obsługa przeciągania kolumn
    if (active.data?.current?.type === 'column' && over.data?.current?.type === 'column') {
      // Zmiana kolejności kolumn
      const oldIndex = boardData.columnOrder.indexOf(activeId as TaskStatus)
      const newIndex = boardData.columnOrder.indexOf(overId as TaskStatus)
      
      if (oldIndex !== newIndex) {
        const newColumnOrder = arrayMove(boardData.columnOrder, oldIndex, newIndex)
        setBoardData(prev => ({
          ...prev,
          columnOrder: newColumnOrder
        }))
      }
      return
    }
    
    // Sprawdzenie, czy przeciągnięto zadanie
    if (active.data?.current?.type === 'task') {
      // Zmienne pomocnicze
      let sourceColumnId: string | undefined = undefined
      let destinationColumnId: string = overId
      
      // Znajdź kolumnę źródłową dla zadania
      sourceColumnId = Object.keys(boardData.columns).find(colId => 
        boardData.columns[colId].taskIds.includes(activeId)
      )
      
      // Jeśli upuszczono na zadanie, znajdź jego kolumnę
      if (filteredTasks[overId]) {
        const overColumnId = Object.keys(boardData.columns).find(colId => 
          boardData.columns[colId].taskIds.includes(overId)
        )
        if (overColumnId) {
          destinationColumnId = overColumnId
        }
      }
      
      if (!sourceColumnId || !destinationColumnId) return
      
      // Jeśli upuszczono w tej samej kolumnie, zmień kolejność
      if (sourceColumnId === destinationColumnId) {
        const column = boardData.columns[sourceColumnId]
        const currentTaskIds = [...column.taskIds]
        const oldIndex = currentTaskIds.indexOf(activeId)
        const newIndex = overId === destinationColumnId 
          ? currentTaskIds.length // Upuszczono na kolumnie, a nie na zadaniu
          : currentTaskIds.indexOf(overId)
        
        if (oldIndex === newIndex) return
        
        const newTaskIds = arrayMove(currentTaskIds, oldIndex, newIndex)
        
        // Aktualizacja stanu tablicy
        setBoardData(prev => ({
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColumnId as string]: {
              ...column,
              taskIds: newTaskIds
            }
          }
        }))
      } 
      // Jeśli upuszczono w innej kolumnie, przenieś zadanie
      else {
        const sourceColumn = boardData.columns[sourceColumnId]
        const destinationColumn = boardData.columns[destinationColumnId]
        
        const sourceTaskIds = [...sourceColumn.taskIds]
        const destinationTaskIds = [...destinationColumn.taskIds]
        
        const sourceIndex = sourceTaskIds.indexOf(activeId)
        // Usuń z oryginalnej kolumny
        sourceTaskIds.splice(sourceIndex, 1)
        
        let destinationIndex = overId === destinationColumnId 
          ? destinationTaskIds.length // Upuszczono na kolumnie, a nie na zadaniu
          : destinationTaskIds.indexOf(overId)
          
        // Wstaw do nowej kolumny
        destinationTaskIds.splice(destinationIndex, 0, activeId)
        
        // Aktualizacja stanu tablicy
        setBoardData(prev => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [activeId]: {
              ...prev.tasks[activeId],
              status: destinationColumn.id
            }
          },
          columns: {
            ...prev.columns,
            [sourceColumnId as string]: {
              ...sourceColumn,
              taskIds: sourceTaskIds
            },
            [destinationColumnId]: {
              ...destinationColumn,
              taskIds: destinationTaskIds
            }
          }
        }))
      }
    }
  }

  return (
    <div className="mb-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToWindowEdges]}
        id={useId()}
      >
        <div className="flex gap-3 justify-between pr-0">
          <SortableContext items={boardData.columnOrder} strategy={horizontalListSortingStrategy} id={useId()}>
            {boardData.columnOrder.map((columnId, index) => {
          const column = boardData.columns[columnId]
              
              // Filtrujemy normalne zadania wg wyszukiwania
              const normalTasks = column.taskIds
                .filter(taskId => filteredTasks[taskId])
                .map(taskId => boardData.tasks[taskId])
              
              // Dodajemy tymczasowe zadania należące do tej kolumny
              const tempTasksForColumn = Object.values(tempTasks)
                .filter(task => task.status === columnId)
              
              // Łączymy normalne i tymczasowe zadania
              const allTasks = [...normalTasks, ...tempTasksForColumn]

              // Dodatkowa klasa dla pierwszej i ostatniej kolumny
              const isFirst = index === 0
              const isLast = !canAddColumn && index === columnCount - 1
              const extraClasses = isFirst ? "ml-0" : isLast ? "mr-0" : ""

          return (
            <KanbanColumn
              key={column.id}
              column={column}
                  tasks={allTasks}
                  onAddTask={handleAddTask}
                  onRemoveColumn={handleRemoveColumn}
                  onEditColumnTitle={handleEditColumnTitle}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  columnCount={canAddColumn ? columnCount + 1 : columnCount}
                  extraClasses={extraClasses}
            />
          )
        })}
          </SortableContext>

          {/* Przycisk dodawania nowej kolumny */}
          {canAddColumn && (
            <Card className={`${columnCount === 3 ? 'w-[24.2%]' : columnCount === 4 ? 'w-[19.2%]' : 'w-full'} min-w-[130px] h-fit shadow-[2px_4px_10px_rgba(0,0,0,0.3)] bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg`}>
          <CardHeader className="p-3">
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-center w-full border border-dashed"
                  onClick={handleAddColumn}
                >
              <Plus className="h-5 w-5 mr-2" />
                  Dodaj kolumnę
            </Button>
          </CardHeader>
        </Card>
          )}
      </div>

        <DragOverlay>
          {activeTask && <KanbanTask task={activeTask} onEdit={handleEditTask} />}
          {activeColumn && <DraggableColumn column={activeColumn.column} tasks={activeColumn.tasks} />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default KanbanBoard 