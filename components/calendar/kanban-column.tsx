"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus } from "lucide-react"

interface KanbanColumnProps {
  title: string
  count: number
  variant: "default" | "blue" | "green"
  tasks: {
    title: string
    description: string
    date: string
    priority: string
  }[]
}

export function KanbanColumn({ title, count, variant, tasks }: KanbanColumnProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "blue":
        return "border-t-blue-500"
      case "green":
        return "border-t-green-500"
      default:
        return "border-t-gray-500"
    }
  }

  return (
    <div className={`flex flex-col border rounded-lg shadow-sm ${getVariantStyles()} border-t-4`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="outline" className="rounded-full">
            {count}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-auto" style={{ maxHeight: "600px" }}>
        {tasks.map((task, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm">{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <p className="text-xs text-muted-foreground">{task.description}</p>
              <div className="flex justify-between items-center mt-3">
                <Badge variant="outline" className="text-xs">
                  {task.date}
                </Badge>
                <Badge
                  variant={
                    task.priority === "Wysoki" ? "destructive" :
                    task.priority === "Średni" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="p-3 border-t">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj zadanie
        </Button>
      </div>
    </div>
  )
}