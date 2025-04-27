"use client"

import React, { useState, useRef, useEffect, useId } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Task, TaskStatus, Column } from "../kanban/types"
import KanbanTask from "./KanbanTask"
import { Button } from "@/components/ui/button"
import { Plus, X, Check, Pencil, GripVertical } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { getColumnHeaderColor } from "./utils"

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onAddTask: (columnId: TaskStatus) => void
  onRemoveColumn?: (columnId: TaskStatus) => void
  onEditColumnTitle?: (columnId: TaskStatus, newTitle: string) => void
  onDeleteTask?: (taskId: string, columnId: TaskStatus) => void
  onEditTask?: (taskId: string, updatedTask: Partial<Task>) => void
  columnCount: number
  extraClasses?: string
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  column, 
  tasks, 
  onAddTask, 
  onRemoveColumn,
  onEditColumnTitle,
  onDeleteTask,
  onEditTask,
  columnCount,
  extraClasses = ""
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generowanie unikalnego ID dla tego komponentu
  const columnId = useId()

  // Konfiguracja sortable dla kolumny (do przeciągania całych kolumn)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Konfiguracja obszaru upuszczania dla zadań wewnątrz kolumny
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  })

  // Klasa dla tła kolumny gdy zadanie jest nad nią podczas przeciągania
  const columnBackgroundClass = isOver ? "bg-sky-50 dark:bg-sky-950/50" : ""

  const isRemovable = column.id !== "todo" && column.id !== "in-progress" && column.id !== "done"

  // Automatyczne ustawienie fokusu na pole edycji tytułu
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  // Zapisanie edytowanego tytułu
  const handleSaveTitle = () => {
    if (editTitle.trim() && onEditColumnTitle) {
      onEditColumnTitle(column.id, editTitle.trim())
    } else {
      setEditTitle(column.title) // Przywrócenie oryginalnego tytułu jeśli pusty
    }
    setIsEditing(false)
  }

  // Obsługa zdarzenia klawisza Enter podczas edycji
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      setEditTitle(column.title)
      setIsEditing(false)
    }
  }

  // Obsługa kliknięcia w tytuł kolumny - nie chcemy edytować podczas przeciągania
  const handleTitleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      setIsEditing(true)
    }
  }

  return (
    <Card 
      ref={setSortableNodeRef}
      style={style}
      className={`min-w-[160px] h-fit ${getColumnHeaderColor(column.id)} shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border-2 rounded-lg ${extraClasses} ${isDragging ? 'opacity-50 z-50 shadow-xl scale-105' : 'opacity-100'} transition-transform duration-200`}
    >
      <CardHeader className="p-3 pb-0 cursor-grab" {...attributes}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            
            {isEditing ? (
              <div className="flex items-center gap-1 w-full pr-1">
                <Input
                  ref={inputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveTitle}
                  className="h-7 py-0 px-1 text-sm font-medium"
                  maxLength={30}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 p-0"
                  onClick={handleSaveTitle}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <CardTitle 
                className="text-sm font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={handleTitleClick}
              >
                {column.title}
              </CardTitle>
            )}
          </div>
          
          <div className="flex gap-1">
            <span className="text-sm mr-1 font-medium text-gray-800 dark:text-gray-400">
              {tasks.length}
            </span>
            
            {isRemovable && onRemoveColumn && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                onClick={() => onRemoveColumn(column.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`p-3 flex flex-col ${columnBackgroundClass} min-h-[200px]`} ref={setDroppableNodeRef}>
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy} id={columnId}>
          {tasks.map((task) => (
            <KanbanTask 
              key={task.id} 
              task={task} 
              onDelete={(taskId) => {
                if (task.isTemp) {
                  if (onEditTask) {
                    onEditTask(taskId, { cancelTemp: true })
                  }
                } else {
                  if (onDeleteTask) {
                    onDeleteTask(taskId, column.id)
                  }
                }
              }}
              onEdit={onEditTask}
              isNew={task.isNew}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 w-full border border-dashed border-gray-300 dark:border-gray-700 rounded-lg mt-2">
            <p className="text-sm text-gray-400 dark:text-gray-500">Przeciągnij tutaj zadanie</p>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          className="mt-4 p-1 h-auto text-xs flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          onClick={() => onAddTask(column.id)}
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Dodaj zadanie
        </Button>
      </CardContent>
    </Card>
  )
}

export default KanbanColumn 