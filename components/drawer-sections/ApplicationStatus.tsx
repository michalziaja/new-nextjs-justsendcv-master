// components/drawer-sections/ApplicationStatus.tsx
import { BookmarkIcon, SendIcon, PhoneIcon, UsersIcon, CheckIcon, XIcon, SaveIcon } from "lucide-react"
import { mockApplications } from "../saved/mockData"
import { ApplicationStatus as ApplicationStatusType } from "../saved/SavedTableTabs"
import { cn } from "@/lib/utils"
import * as React from 'react'

interface ApplicationStatusProps {
  application: typeof mockApplications[0]
  onStatusChange?: (newStatus: ApplicationStatusType) => void
}

export function ApplicationStatus({ application, onStatusChange }: ApplicationStatusProps) {
  const [activeStep, setActiveStep] = React.useState<ApplicationStatusType>(application.status)

  const statusSteps = [
    { status: 'zapisane' as const, date: '12.03.2024', icon: BookmarkIcon },
    { status: 'wysłane' as const, date: '13.03.2024', icon: SendIcon },
    { status: 'kontakt' as const, date: '14.03.2024', icon: PhoneIcon },
    { status: 'rozmowa' as const, date: '15.03.2024', icon: UsersIcon },
    { status: 'oferta' as const, date: '16.03.2024', icon: CheckIcon },
    { status: 'odmowa' as const, date: '16.03.2024', icon: XIcon }
  ] as const

  const getStatusStyles = (status: ApplicationStatusType) => {
    switch (status) {
      case 'wysłane': return 'bg-blue-600 text-white hover:bg-blue-700'
      case 'kontakt': return 'bg-yellow-600 text-white hover:bg-yellow-700'
      case 'rozmowa': return 'bg-purple-600 text-white hover:bg-purple-700'
      case 'oferta': return 'bg-green-600 text-white hover:bg-green-700'
      case 'odmowa': return 'bg-red-600 text-white hover:bg-red-700'
      case 'zapisane': return 'bg-gray-600 text-white hover:bg-gray-700'
      default: return 'bg-gray-200 text-gray-500 hover:bg-gray-300'
    }
  }

  const currentStepIndex = statusSteps.findIndex(step => step.status === activeStep)

  const handleStepClick = (status: ApplicationStatusType, index: number) => {
    setActiveStep(status)
    if (onStatusChange) {
      onStatusChange(status)
    }
  }

  return (
    <div className="py-2">
      <div className="relative flex items-center justify-between gap-x-4 sm:gap-x-4 md:gap-x-4">
        {/* Linia tła */}
        <div className="absolute left-16 right-8 sm:right-12 md:right-16 top-5 sm:top-[22px] md:top-6 h-[2px] bg-gray-300/50 transition-all duration-500 ease-in-out z-10" />
        
        {/* Animowana linia postępu */}
        <div 
          className="absolute left-12 right-12 top-5 sm:top-[22px] md:top-6 h-[2px] bg-primary/100 transition-all duration-700 ease-in-out z-10"
          style={{ 
            width: currentStepIndex >= 0 
              ? `calc(${(85 / (statusSteps.length - 1)) * currentStepIndex}% - ${currentStepIndex === 0 ? 20 : 0}px)`
              : '0%',
          }} 
        />

        {/* Krok po kroku */}
        {statusSteps.map((step, index) => {
          const Icon = step.icon
          const isActive = activeStep === 'odmowa' 
            ? currentStepIndex >= index && step.status !== 'oferta'
            : currentStepIndex >= index
          const isCurrent = step.status === activeStep
          const isPrevious = currentStepIndex > index && !isCurrent

          return (
            <div 
              key={step.status}
              className={cn(
                "relative flex flex-col items-center z-20 w-full",
                step.status === 'oferta' && activeStep === 'odmowa' && "opacity-100"
              )}
            >
              {/* Kółko ze statusem */}
              <div
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 relative",
                  isActive ? getStatusStyles(step.status) : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
                  isCurrent && "ring-2 ring-primary ring-offset-2 scale-110 shadow-xl shadow-primary/20",
                  isPrevious && "shadow-xl",
                  !isActive && "shadow-xl",
                  step.status === 'oferta' && activeStep === 'odmowa' && "cursor-not-allowed opacity-50",
                  "hover:scale-105"
                )}
                title={step.status}
                onClick={() => {
                  if (!(step.status === 'oferta' && activeStep === 'odmowa')) {
                    handleStepClick(step.status, index)
                  }
                }}
              >
                <Icon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 transition-transform duration-300",
                  isCurrent && "scale-110 text-white",
                  isPrevious && "text-white/90"
                )} />
              </div>

              {/* Etykieta */}
              <div className="mt-2 sm:mt-2.5 md:mt-3 text-center w-full">
                <span className={cn(
                  "text-[10px] sm:text-[11px] font-medium block transition-colors duration-300 truncate px-1",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                </span>
                <span className={cn(
                  "text-[8px] sm:text-[9px] block transition-colors duration-300",
                  isActive ? "text-primary/70" : "text-muted-foreground/70"
                )}>
                  {step.date}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}