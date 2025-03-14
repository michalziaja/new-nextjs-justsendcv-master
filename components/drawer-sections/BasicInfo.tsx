// components/drawer-sections/BasicInfo.tsx
import { Button } from "@/components/ui/button"
import { Building2, ExternalLink, Timer, ArrowUpCircle, Circle } from "lucide-react"
import Image from "next/image"
import { mockApplications } from "../saved/mockData"
import { cn } from "@/lib/utils"
import * as React from "react"

interface BasicInfoProps {
  application: typeof mockApplications[0]
  isDesktop: boolean
}

export function BasicInfo({ application, isDesktop }: BasicInfoProps) {
  const [priority, setPriority] = React.useState(application.priority || 0)
  const [hoverPriority, setHoverPriority] = React.useState(0)

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

  const handlePriorityClick = (value: number) => {
    setPriority(value === priority ? 0 : value)
    // Dodaj funkcję do zapisywania priorytetu w bazie danych
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-6">
      {/* Firma */}
      <div className="space-y-0">
        <h3 className="font-medium text-md text-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-200" />
          <span className="text-gray-600 dark:text-gray-200">Firma:</span> 
          <p className="text-md font-medium truncate">{application.company}</p>
        </h3>
      </div>

      {/* Link */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm flex items-center gap-1">
          {/* <ExternalLink className="h-4 w-4" /> */}
          {/* Link do oferty */}
        </h3>
        <Button 
          variant="ghost" 
          className="h-auto p-0 text-primary hover:text-primary/80"
          onClick={() => window.open(application.url, '_blank')}
        >
          <span className="underline truncate">{new URL(application.url).hostname}</span>
        </Button>
      </div>

      {/* Ważna do */}
      <div className="space-y-1">
        <h3 className="font-medium text-md flex items-center gap-1">
          <Timer className="h-4 w-4 text-gray-600 dark:text-gray-200" />
          <span className="text-gray-600 dark:text-gray-200">Ważna do:</span>
          <p className="text-sm">{application.validUntil}</p>
        </h3>
      </div>

      {/* Priorytet */}
      <div className="space-y-1">
        <h3 className="font-medium text-md flex items-center gap-2">
          {/* <Circle className="h-4 w-4" /> */}
          <span className="text-gray-600 dark:text-gray-200">Priorytet:</span>
        
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handlePriorityClick(value)}
              onMouseEnter={() => setHoverPriority(value)}
              onMouseLeave={() => setHoverPriority(0)}
              className="p-0.2 hover:scale-110 transition-transform relative group"
              title={`Priorytet ${value}`}
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