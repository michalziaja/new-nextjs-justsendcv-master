"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

export function CalendarSection() {
  return (
    <Card className="h-full border-2 border-gray-300 dark:border-gray-800
      shadow-[3px_6px_15px_rgba(1,0,0,0.3)] 
      dark:shadow-gray-800/50
      bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 pt-2">
          <CalendarDays className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          Terminarz
        </CardTitle>
        
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Rozmowa kwalifikacyjna</p>
              <p className="text-sm text-muted-foreground">Software Solutions</p>
            </div>
            <div className="text-sm font-medium">
              10:00, 15 Lip
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Targi pracy IT</p>
              <p className="text-sm text-muted-foreground">Centrum Kongresowe</p>
            </div>
            <div className="text-sm font-medium">
              12:00, 22 Lip
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 