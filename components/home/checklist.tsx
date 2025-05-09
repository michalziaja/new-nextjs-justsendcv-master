"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Download, FileText, Settings, User, Send, BookOpen, Target, Star, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Lista zadań z ikonami i statusem
const tasks = [
  // Kolumna 1
  {
    column: 1,
    tasks: [
      {
        title: "Zainstaluj wtyczkę",
        icon: <Download className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00B2FF] to-blue-600" />,
        completed: true
      },
      {
        title: "Uzupełnij profil",
        icon: <User className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600" />,
        completed: false
      },
      {
        title: "Ustaw cel",
        icon: <Target className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600" />,
        completed: false
      },
      {
        title: "Trenuj do rozmowy",
        icon: <BookOpen className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600" />,
        completed: false
      }
    ]
  },
  // Kolumna 2
  {
    column: 2,
    tasks: [
      {
        title: "Zapisz 5 ofert",
        icon: <FileText className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600" />,
        completed: false,
        progress: "2/5"
      },
      {
        title: "Stwórz CV",
        icon: <Settings className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600" />,
        completed: false
      },
      {
        title: "Wyślij 2 oferty",
        icon: <Send className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600" />,
        completed: false,
        progress: "0/2"
      },
      {
        title: "Oceń wtyczkę",
        icon: <Star className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600" />,
        completed: false
      }
    ]
  }
]

export function Checklist() {
  return (
    <Card className="col-span-1 rounded-sm border-1 border-gray-100 dark:border-gray-800
    shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
    dark:shadow-slate-900/20
    bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-[#00B2FF] stroke-2 transform transition-transform hover:scale-110" />
          <CardTitle>Checklista</CardTitle>
        </div>
        <Button 
          variant="link" 
          size="icon" 
          className="h-8 w-8 transition-transform duration-200 hover:scale-155 active:scale-90">
          <RefreshCw className="h-4 w-4 text-[#00B2FF]" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {tasks.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-1">
              {column.tasks.map((task, taskIndex) => (
                <div 
                  key={taskIndex} 
                  className={`
                    flex items-center gap-3 p-2 rounded-sm
                    hover:bg-gray-50 dark:hover:bg-gray-800/50
                    transition-colors duration-200
                    ${task.completed ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`
                    h-5 w-5 rounded border-2 
                    ${task.completed 
                      ? 'border-gradient-to-r border-blue-500 dark:border-gradient-to-r dark:border-blue-500 bg-gradient-to-r from-blue-500 to-blue-600 dark:bg-gradient-to-r dark:from-blue-500 dark:to-blue-600' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                    flex items-center justify-center
                    transition-colors duration-200
                  `}>
                    {task.completed && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    {task.icon}
                    <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {task.title}
                    </span>
                  </div>
                  {task.progress && (
                    <span className="text-xs text-muted-foreground">
                      {task.progress}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 