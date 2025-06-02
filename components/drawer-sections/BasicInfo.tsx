// components/drawer-sections/BasicInfo.tsx
import { Button } from "@/components/ui/button"
import { Building2, ExternalLink, Timer, ArrowUpCircle, Circle, Star } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import * as React from "react"
import { createClient } from "@/utils/supabase/client"
import { JobOffer } from "../saved/ApplicationDetailsDrawer"

interface BasicInfoProps {
  application: JobOffer
  isDesktop: boolean
  onPriorityChange?: (newPriority: number) => void
}

export function BasicInfo({ application, isDesktop, onPriorityChange }: BasicInfoProps) {
  const [priority, setPriority] = React.useState(application.priority || 0)
  const [hoverPriority, setHoverPriority] = React.useState(0)
  const [isUpdating, setIsUpdating] = React.useState(false)

  // Aktualizacja priorytetów przy zmianie aplikacji
  React.useEffect(() => {
    setPriority(application.priority || 0)
  }, [application])

  const getPriorityColor = (value: number) => {
    switch(value) {
      case 1: return 'text-green-500 fill-green-500'
      case 2: return 'text-yellow-500 fill-yellow-500'
      case 3: return 'text-orange-500 fill-orange-500'
      case 4: return 'text-red-400 fill-red-400'
      case 5: return 'text-red-600 fill-red-600'
      default: return 'text-muted-foreground/40 fill-none'
    }
  }

  // Funkcja zapisująca priorytet w bazie danych Supabase
  const updatePriorityInDatabase = async (newPriority: number) => {
    try {
      setIsUpdating(true)
      const supabase = createClient()
      
      // Aktualizacja priorytetu w bazie danych
      const { error } = await supabase
        .from('job_offers')
        .update({ priority: newPriority })
        .eq('id', application.id)
      
      if (error) {
        console.error("Błąd podczas aktualizacji priorytetu:", error)
        // Przywracamy poprzednią wartość w przypadku błędu
        setPriority(application.priority || 0)
        return
      }
      
      // Wywołanie funkcji przekazanej przez props, jeśli istnieje
      if (onPriorityChange) {
        onPriorityChange(newPriority)
      }
    } catch (error) {
      console.error("Wystąpił nieoczekiwany błąd:", error)
      // Przywracamy poprzednią wartość w przypadku błędu
      setPriority(application.priority || 0)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityClick = (value: number) => {
    // Ustaw nową wartość priorytetu (0 jeśli kliknięto ten sam poziom)
    const newPriority = value === priority ? 0 : value
    
    // Aktualizacja UI
    setPriority(newPriority)
    
    // Zapisz w bazie danych
    updatePriorityInDatabase(newPriority)
  }

  return (
    <div className="grid ml-2 grid-cols-2 gap-x-6 gap-y-6">
      {/* Firma */}
      <div className="space-y-0">
        <h3 className="font-medium text-md text-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="text-gray-600 dark:text-gray-200">Firma:</span> 
          <p className="text-md font-medium truncate">{application.company}</p>
        </h3>
      </div>

      {/* Link */}
      <div className="space-y-2 mt-1">
        <h3 className="font-medium text-md text-foreground flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-green-500" />
          <span className="text-gray-600 dark:text-gray-200">Link:</span>
          <Button 
            variant="ghost" 
            className="h-auto p-0 bg-transparent text-primary hover:text-primary/80"
            onClick={() => application.url && window.open(application.url, '_blank')}
          >
            <span className="truncate">{application.site}</span>
          </Button>
        </h3>
      </div>

      {/* Ważna do */}
      <div className="space-y-1">
        <h3 className="font-medium text-md flex items-center gap-1">
          <Timer className="h-4 w-4 text-orange-500" />
          <span className="text-gray-600 dark:text-gray-200">Ważna do:</span>
          <p className="text-sm">{application.expire ? application.expire.substring(0, 10) : "-"}</p>
        </h3>
      </div>

      {/* Priorytet */}
      <div className="space-y-1">
        <h3 className="font-medium text-md flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-gray-600 dark:text-gray-200">Priorytet:</span>
        
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => !isUpdating && handlePriorityClick(value)}
              onMouseEnter={() => setHoverPriority(value)}
              onMouseLeave={() => setHoverPriority(0)}
              className={cn(
                "p-0.2 hover:scale-110 transition-transform relative group",
                isUpdating && "opacity-60 cursor-not-allowed"
              )}
              title={`Priorytet ${value}`}
              disabled={isUpdating}
            >
              <Circle
                className={cn(
                  "h-4 w-4 transition-colors sm:h-5 sm:w-5",
                  (hoverPriority ? value <= hoverPriority : value <= priority)
                    ? getPriorityColor(value)
                    : "text-muted-foreground/40"
                )}
              />
            </button>
            
          ))}
         
        </div>
        </h3>
      </div>
    </div>
  )
} 