// "use client"

// import React, { useState, useEffect } from "react"
// import { 
//   Card, 
//   CardContent, 
//   CardDescription, 
//   CardHeader, 
//   CardTitle, 
//   CardFooter 
// } from "@/components/ui/card"
// import { 
//   Dialog, 
//   DialogContent, 
//   DialogDescription, 
//   DialogFooter, 
//   DialogHeader, 
//   DialogTitle 
// } from "@/components/ui/dialog"
// import { Badge } from "@/components/ui/badge"
// import { CalendarIcon, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from "@/components/ui/select"
// import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays } from "date-fns"
// import { pl } from "date-fns/locale"

// // Typ dla wydarzenia
// interface CalendarEvent {
//   id: string
//   title: string
//   description?: string
//   date: Date
//   color: "blue" | "green" | "red" | "purple" | "amber"
// }

// export function CalendarTab() {
//   // Stan aktualnej daty, dni w miesiącu i wydarzeń
//   const [currentDate, setCurrentDate] = useState(new Date())
//   const [days, setDays] = useState<Date[]>([])
//   const [events, setEvents] = useState<CalendarEvent[]>([
//     { 
//       id: "1", 
//       title: "Rozmowa kwalifikacyjna", 
//       description: "Software Solutions - stanowisko Frontend Developer",
//       date: new Date(new Date().setDate(new Date().getDate() + 3)), 
//       color: "blue" 
//     },
//     { 
//       id: "2", 
//       title: "Deadline aplikacji", 
//       description: "Termin wysłania CV do XYZ Corp",
//       date: new Date(new Date().setDate(new Date().getDate() + 7)), 
//       color: "red" 
//     },
//     { 
//       id: "3", 
//       title: "Spotkanie networkingowe", 
//       description: "IT Hub, kontakt z potencjalnymi pracodawcami",
//       date: new Date(new Date().setDate(new Date().getDate() + 14)), 
//       color: "purple" 
//     }
//   ])

//   // Stan dialogu dodawania wydarzenia
//   const [isAddEventOpen, setIsAddEventOpen] = useState(false)
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null)
//   const [newEvent, setNewEvent] = useState({
//     title: "",
//     description: "",
//     color: "blue" as CalendarEvent["color"]
//   })

//   // Dni tygodnia (nagłówki)
//   const daysOfWeek = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nie"]

//   // Obliczenie dni do wyświetlenia w kalendarzu
//   useEffect(() => {
//     const start = startOfMonth(currentDate)
//     const end = endOfMonth(currentDate)
    
//     // Pobierz wszystkie dni w aktualnym miesiącu
//     let daysInMonth = eachDayOfInterval({ start, end })
    
//     // Znajdź pierwszy dzień tygodnia (poniedziałek)
//     let firstDay = start.getDay() || 7 // Niedziela w JS to 0, ale w naszym układzie to 7
//     firstDay = firstDay === 1 ? firstDay : firstDay - 1 // Dostosowanie do poniedziałku jako 0
    
//     // Dodaj dni z poprzedniego miesiąca
//     const prevMonthDays = Array.from({ length: firstDay }, (_, i) => 
//       addDays(start, -(firstDay - i))
//     )
    
//     // Połącz dni z poprzedniego miesiąca z dniami bieżącego miesiąca
//     daysInMonth = [...prevMonthDays, ...daysInMonth]
    
//     // Dodaj dni z następnego miesiąca, aby uzupełnić siatkę (do 42 dni - 6 tygodni)
//     const remainingDays = 42 - daysInMonth.length
//     const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => 
//       addDays(end, i + 1)
//     )
    
//     setDays([...daysInMonth, ...nextMonthDays])
//   }, [currentDate])

//   // Funkcja do zmiany miesiąca
//   const changeMonth = (direction: "prev" | "next") => {
//     setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
//   }

//   // Funkcja otwierająca dialog dodawania wydarzenia dla wybranego dnia
//   const handleDayClick = (day: Date) => {
//     setSelectedDate(day)
//     setIsAddEventOpen(true)
//   }

//   // Funkcja zamykająca dialog i resetująca formularz
//   const handleCloseDialog = () => {
//     setIsAddEventOpen(false)
//     setNewEvent({ title: "", description: "", color: "blue" })
//     setSelectedDate(null)
//   }

//   // Funkcja dodająca nowe wydarzenie
//   const handleAddEvent = () => {
//     if (!selectedDate || !newEvent.title.trim()) return
    
//     const event: CalendarEvent = {
//       id: Date.now().toString(),
//       title: newEvent.title.trim(),
//       description: newEvent.description.trim() || undefined,
//       date: selectedDate,
//       color: newEvent.color
//     }
    
//     setEvents([...events, event])
//     handleCloseDialog()
//   }

//   // Funkcja usuwająca wydarzenie
//   const handleRemoveEvent = (id: string) => {
//     setEvents(events.filter(event => event.id !== id))
//   }

//   // Pomocnicza funkcja do uzyskania wydarzeń dla danego dnia
//   const getEventsForDay = (day: Date) => {
//     return events.filter(event => isSameDay(event.date, day))
//   }

//   // Funkcja do wyświetlania koloru wydarzenia
//   const getEventColorClass = (color: CalendarEvent["color"]) => {
//     switch (color) {
//       case "blue": return "bg-blue-100 border-l-blue-500 dark:bg-blue-900/40 dark:border-l-blue-400"
//       case "green": return "bg-green-100 border-l-green-500 dark:bg-green-900/40 dark:border-l-green-400"
//       case "red": return "bg-red-100 border-l-red-500 dark:bg-red-900/40 dark:border-l-red-400"
//       case "purple": return "bg-purple-100 border-l-purple-500 dark:bg-purple-900/40 dark:border-l-purple-400"
//       case "amber": return "bg-amber-100 border-l-amber-500 dark:bg-amber-900/40 dark:border-l-amber-400"
//       default: return "bg-blue-100 border-l-blue-500 dark:bg-blue-900/40 dark:border-l-blue-400"
//     }
//   }

//   return (
//     <div className="space-y-4">
//       <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-sidebar shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
//         <CardHeader className="px-6 py-1 flex flex-row items-center justify-between">
//           <div>
//             <CardTitle className="text-xl ml-4">{format(currentDate, 'LLLL yyyy', { locale: pl })}</CardTitle>
//             {/* <CardDescription>Kalendarz wydarzeń</CardDescription> */}
//           </div>
//           <div className="flex items-center space-x-2 mr-4">
//             <Button variant="outline" size="icon" onClick={() => changeMonth("prev")}>
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
//               Dzisiaj
//             </Button>
//             <Button variant="outline" size="icon" onClick={() => changeMonth("next")}>
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0 ml-10 mr-10 mb-3">
//           <div className="grid grid-cols-7 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-gray-50 dark:bg-gray-800">
//             {/* Nagłówki dni tygodnia */}
//             {daysOfWeek.map((day) => (
//               <div key={day} className="text-center font-medium text-sm py-2">
//                 {day}
//               </div>
//             ))}
//           </div>
          
//           <div className="grid grid-cols-7">
//             {/* Dni miesiąca */}
//             {days.map((day, index) => {
//               const isCurrentMonth = isSameMonth(day, currentDate)
//               const isToday = isSameDay(day, new Date())
//               const dayEvents = getEventsForDay(day)
              
//               return (
//                 <div
//                   key={index}
//                   onClick={() => handleDayClick(day)}
//                   className={`min-h-[100px] p-1 border-1 rounded-lg border-zinc-200 dark:border-zinc-700 relative cursor-pointer
//                     ${isCurrentMonth ? "bg-white dark:bg-gray-800" : "bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-500"}
//                     ${isToday ? "bg-blue-50 dark:bg-blue-950/20" : ""}
//                     hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors
//                   `}
//                 >
//                   <div className={`flex justify-end p-1 ${isToday ? "font-bold text-blue-600 dark:text-blue-400" : ""}`}>
//                     {format(day, 'd')}
//                   </div>
                  
//                   <div className="space-y-1 mt-1 overflow-hidden">
//                     {dayEvents.map(event => (
//                       <div 
//                         key={event.id} 
//                         className={`p-1 rounded text-xs border-l-2 ${getEventColorClass(event.color)} flex justify-between`}
//                         title={event.description || event.title}
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <span className="truncate">{event.title}</span>
//                         <button 
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             handleRemoveEvent(event.id)
//                           }}
//                           className="opacity-0 hover:opacity-100 text-zinc-400 hover:text-red-500"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
                  
//                   {isCurrentMonth && dayEvents.length === 0 && (
//                     <div 
//                       className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 text-zinc-400 hover:text-blue-500 transition-opacity"
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         handleDayClick(day)
//                       }}
//                     >
//                       <Plus className="h-4 w-4" />
//                     </div>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Dialog dodawania wydarzenia */}
//       <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Dodaj wydarzenie</DialogTitle>
//             <DialogDescription>
//               {selectedDate && `Data: ${format(selectedDate, 'PPP', { locale: pl })}`}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <label htmlFor="event-title" className="text-sm font-medium">
//                 Tytuł wydarzenia
//               </label>
//               <Input
//                 id="event-title"
//                 value={newEvent.title}
//                 onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
//                 placeholder="Wprowadź tytuł wydarzenia"
//               />
//             </div>
//             <div className="grid gap-2">
//               <label htmlFor="event-description" className="text-sm font-medium">
//                 Opis (opcjonalny)
//               </label>
//               <Textarea
//                 id="event-description"
//                 value={newEvent.description}
//                 onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
//                 placeholder="Dodaj opis wydarzenia"
//                 className="resize-none"
//                 rows={3}
//               />
//             </div>
//             <div className="grid gap-2">
//               <label htmlFor="event-color" className="text-sm font-medium">
//                 Kolor
//               </label>
//               <Select 
//                 value={newEvent.color} 
//                 onValueChange={(value: CalendarEvent["color"]) => 
//                   setNewEvent({...newEvent, color: value})
//                 }
//               >
//                 <SelectTrigger id="event-color">
//                   <SelectValue placeholder="Wybierz kolor" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="blue">Niebieski</SelectItem>
//                   <SelectItem value="green">Zielony</SelectItem>
//                   <SelectItem value="red">Czerwony</SelectItem>
//                   <SelectItem value="purple">Fioletowy</SelectItem>
//                   <SelectItem value="amber">Pomarańczowy</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={handleCloseDialog}>Anuluj</Button>
//             <Button onClick={handleAddEvent} disabled={!newEvent.title.trim()}>Zapisz</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }