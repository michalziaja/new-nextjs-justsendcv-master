"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

export function CalendarSection() {
  return (
    <Card className="h-full rounded-sm border-1 border-gray-300 dark:border-gray-800
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)] 
      dark:shadow-slate-900/20
      bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#00B2FF] stroke-2 transform transition-transform hover:scale-110" />
          <CardTitle>Terminarz</CardTitle>
        </div>
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