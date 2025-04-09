"use client"

import React, { useState, useRef, useEffect } from "react"
import { Task, TaskPriority } from "../kanban/types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, X, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface KanbanTaskProps {
  task: Task
  onDelete?: (taskId: string) => void
  onEdit?: (taskId: string, updatedTask: Partial<Task>) => void
  isNew?: boolean
}

const KanbanTask: React.FC<KanbanTaskProps> = ({ task, onDelete, onEdit, isNew = false }) => {
  // Zadanie tymczasowe lub nowe powinno być od razu w trybie edycji
  const [isEditing, setIsEditing] = useState(isNew || task.isTemp)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || "")
  const [editDueDate, setEditDueDate] = useState(task.dueDate || "")
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority || "medium")
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  // Konfiguracja sortable dla zadania (do przeciągania)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Automatyczne ustawienie fokusu na pole edycji tytułu
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditing])

  // Handler dla przycisku usuwania zadania
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Zatrzymuje propagację, aby nie uruchamiać drag
    if (onDelete) {
      onDelete(task.id)
    }
  }
  
  // Handler dla przycisku edycji zadania
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Zatrzymuje propagację, aby nie uruchamiać drag
    setIsEditing(true)
  }
  
  // Handler dla anulowania edycji
  const handleCancelEdit = () => {
    // Jeśli to tymczasowe zadanie, usuwamy je całkowicie
    if (task.isTemp && onEdit) {
      onEdit(task.id, { cancelTemp: true })
      return
    }
    
    // W przeciwnym razie przywracamy oryginalne wartości
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditDueDate(task.dueDate || "")
    setEditPriority(task.priority || "medium")
    setIsEditing(false)
  }
  
  // Handler dla zapisania zmian
  const handleSaveEdit = () => {
    // Nie zapisujemy pustego tytułu
    if (!editTitle.trim()) {
      // Jeśli to tymczasowe zadanie, usuwamy je
      if (task.isTemp && onEdit) {
        onEdit(task.id, { cancelTemp: true })
        return
      }
      
      // W przeciwnym razie przywracamy oryginalne wartości
      setEditTitle(task.title)
      return
    }
    
    if (onEdit && (
      editTitle !== task.title || 
      editDescription !== task.description || 
      editDueDate !== task.dueDate ||
      editPriority !== task.priority
    )) {
      onEdit(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate,
        priority: editPriority,
      })
    }
    
    // Dla normalnych zadań przełączamy z powrotem na widok bez edycji
    // Dla tymczasowych zadań to nie jest potrzebne, bo po zapisaniu zadanie już nie będzie tymczasowe
    if (!task.isTemp) {
      setIsEditing(false)
    }
  }
  
  // Handler dla klawisza Escape (anulowanie edycji)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter zatwierdza formularz
      handleSaveEdit()
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "dd.MM.yyyy", { locale: pl })
    } catch (error) {
      return ""
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

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 mb-3 bg-white dark:bg-sidebar rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'opacity-50 z-50 shadow-xl scale-105' : 'opacity-100'} relative`}
    >
      {isEditing ? (
        <div className="flex flex-col space-y-2" onClick={(e) => e.stopPropagation()}>
          <Input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tytuł zadania"
            className="text-sm mb-1"
          />
          
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Opis zadania"
            className="text-xs resize-none min-h-[60px]"
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-gray-500" />
              <Input
                type="date"
                value={editDueDate ? editDueDate.split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date) {
                    setEditDueDate(new Date(date).toISOString());
                  } else {
                    setEditDueDate('');
                  }
                }}
                className="text-xs h-7 py-0 w-34"
              />
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500"></span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setEditPriority("low")}
                  className={cn(
                    "h-4 w-4 rounded-full border",
                    editPriority === "low" ? "ring-2 ring-green-300 dark:ring-green-700 ring-offset-1" : "",
                    "bg-green-500 border-green-700"
                  )}
                  title="Niski priorytet"
                />
                <button
                  type="button"
                  onClick={() => setEditPriority("medium")}
                  className={cn(
                    "h-4 w-4 rounded-full border",
                    editPriority === "medium" ? "ring-2 ring-blue-300 dark:ring-blue-700 ring-offset-1" : "",
                    "bg-blue-500 border-blue-700"
                  )}
                  title="Średni priorytet"
                />
                <button
                  type="button"
                  onClick={() => setEditPriority("high")}
                  className={cn(
                    "h-4 w-4 rounded-full border",
                    editPriority === "high" ? "ring-2 ring-red-300 dark:ring-red-700 ring-offset-1" : "",
                    "bg-red-500 border-red-700"
                  )}
                  title="Wysoki priorytet"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCancelEdit}
              className="text-xs h-7 py-0"
            >
              Anuluj
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSaveEdit}
              className="text-xs h-7 py-0"
            >
              Zapisz
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute top-1 right-1 flex space-x-1">
            <button
              onClick={handleEditClick}
              className="h-5 w-5 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Edytuj zadanie"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              className="h-5 w-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Usuń zadanie"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          
          <div className="text-sm font-medium pr-12 mb-1">{task.title}</div>
          
          {task.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</div>
          )}
          
          <div className="flex flex-wrap justify-between items-center mt-2">
            {task.dueDate ? (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            ) : (
              <div></div> // Pusty element, aby zachować justify-between
            )}
            
            <div 
              className={`h-3 w-3 rounded-full ${getPriorityColor(task.priority)}`} 
              title={`Priorytet: ${getPriorityLabel(task.priority)}`}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default KanbanTask 