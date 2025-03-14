"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function CalendarTab() {
  // Dummy data dla kalendarza
  const daysOfWeek = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nie"]
  const events = {
    3: "Rozmowa kwalifikacyjna",
    10: "Aplikacja: deadline",
    15: "Spotkanie networkingowe",
    22: "Targi pracy",
    28: "Szkolenie"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-px bg-muted rounded-md overflow-hidden">
            {/* Nagłówki dni tygodnia */}
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-card p-3 text-center font-medium text-sm">
                {day}
              </div>
            ))}
            
            {/* Dni miesiąca - przykładowa siatka */}
            {Array.from({ length: 35 }).map((_, index) => {
              const day = index + 1
              const isToday = day === 15
              const hasEvent = Object.keys(events).some((d) => parseInt(d) === day)

              return (
                <div
                  key={index}
                  className={`bg-card min-h-28 p-2 relative ${isToday ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                >
                  <div
                    className={`text-sm font-medium absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center ${isToday ? "bg-blue-500 text-white" : ""}`}
                  >
                    {day}
                  </div>
                  
                  {hasEvent && (
                    <div className="pt-8">
                      <div className="bg-blue-100 dark:bg-blue-900/40 p-1 rounded text-xs mt-1 border-l-2 border-blue-500">
                        {events[day as keyof typeof events]}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Najbliższe wydarzenia</CardTitle>
            <CardDescription>Wydarzenia w nadchodzących dniach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Rozmowa kwalifikacyjna</p>
                    <p className="text-sm text-muted-foreground">Software Solutions</p>
                  </div>
                </div>
                <Badge>Dziś, 10:00</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Spotkanie networkingowe</p>
                    <p className="text-sm text-muted-foreground">IT Hub</p>
                  </div>
                </div>
                <Badge variant="outline">15 Lip, 18:00</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dodaj wydarzenie</CardTitle>
            <CardDescription>Szybkie dodawanie nowego wydarzenia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tytuł wydarzenia</label>
                <Input placeholder="Wprowadź tytuł wydarzenia" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Opis</label>
                <Input placeholder="Opis wydarzenia (opcjonalnie)" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Dodaj wydarzenie</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}