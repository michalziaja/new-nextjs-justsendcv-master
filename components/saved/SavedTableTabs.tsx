"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Typy statusów
export type ApplicationStatus = 'wszystkie' | 'zapisana' | 'wysłana' | 'kontakt' | 'rozmowa' | 'odmowa' | 'oferta';

interface SavedTableTabsProps {
  activeStatus: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
}

// Konfiguracja zakładek z kolorami
const tabConfig = [
  { 
    value: 'wszystkie', 
    label: 'Wszystkie', 
    color: 'border-t-gray-600 dark:border-t-gray-600'
  },
  { 
    value: 'zapisana', 
    label: 'Zapisana', 
    color: 'border-t-blue-600 dark:border-t-blue-600'
  },
  { 
    value: 'wysłana', 
    label: 'Wysłana', 
    color: 'border-t-purple-600 dark:border-t-purple-600'
  },
  { 
    value: 'kontakt', 
    label: 'Kontakt', 
    color: 'border-t-yellow-600 dark:border-t-yellow-600'
  },
  { 
    value: 'rozmowa', 
    label: 'Rozmowa', 
    color: 'border-t-cyan-600 dark:border-t-cyan-600'
  },
  { 
    value: 'odmowa', 
    label: 'Odmowa', 
    color: 'border-t-red-600 dark:border-t-red-600'
  },
  { 
    value: 'oferta', 
    label: 'Oferta', 
    color: 'border-t-green-600 dark:border-t-green-600'
  },
] as const;

export function SavedTableTabs({ activeStatus, onStatusChange }: SavedTableTabsProps) {
  return (
    <Tabs value={activeStatus} onValueChange={(value) => onStatusChange(value as ApplicationStatus)} className="w-full">
      <TabsList className="grid w-full grid-cols-7 mb-0 mt-0 bg-background dark:bg-[#0A0F1C] rounded-t-sm">
        {tabConfig.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className={cn(
              "relative text-[12px] sm:text-sm md:text-md ",
              "whitespace-nowrap overflow-hidden text-ellipsis",
              "border border-gray-300 dark:border-gray-700",
              "rounded-t-sm rounded-b-none",
              "transition-all duration-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800/50",
              "border-t-1",
              `${tab.color}`,
              "data-[state=active]:border-t-7",
              "data-[state=active]:bg-white dark:data-[state=active]:bg-sidebar",
              "shadow-sm dark:shadow-slate-900/20",
              "data-[state=active]:shadow-md dark:data-[state=active]:shadow-slate-900/20",
              `${
                activeStatus === tab.value 
                  ? "bg-white dark:bg-slate-900"
                  : "bg-gray-50 dark:bg-slate-800"
              }`
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
} 