// components/saved/ApplicationDetailsDrawer.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mockApplications } from "./mockData"
import { useMediaQuery } from "@/hooks/use-media-query"
import { BasicInfo } from "@/components/drawer-sections/BasicInfo"
import { ApplicationStatus } from "@/components/drawer-sections/ApplicationStatus"
import { JobAnalysis } from "@/components/drawer-sections/JobAnalysis"
import { JobDescription } from "@/components/drawer-sections/JobDescription"
import { Notes } from "@/components/drawer-sections/Notes"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { ApplicationStatus as ApplicationStatusType } from "./SavedTableTabs"

interface KeywordWithCategory {
  keyword: string
  category: 'industrySkills' | 'softSkills' | 'requirements' | 'benefits' | 'generalJobTerms'
}

interface ApplicationDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  application: typeof mockApplications[0] | null
  onEdit: () => void
  onDelete?: () => void
  onStatusChange?: (newStatus: ApplicationStatusType) => void
  onPriorityChange?: (newPriority: number) => void
}

// Typ dla oferty pracy z Supabase
export type JobOffer = {
  id: string;
  user_id: string;
  title: string;
  company: string;
  site: string | null;
  url: string | null;
  status: string;
  full_description: string | null;
  note: string | null;
  salary: string | null;
  created_at: string;
  status_changes: string[];
  expire: string | null;
  priority: number;
}

export function ApplicationDetailsDrawer({
  isOpen,
  onClose,
  application,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange
}: ApplicationDetailsDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 900px)")
  const [foundKeywords, setFoundKeywords] = useState<KeywordWithCategory[]>([])
  
  if (!application) return null

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <div className={`${isDesktop ? 'px-4' : 'px-2'} py-2 h-full`}>
          {/* Górna sekcja - podstawowe informacje */}
          <div className="mb-6">
            <BasicInfo 
              application={application} 
              isDesktop={isDesktop} 
              onPriorityChange={onPriorityChange}
            />
          </div>
          {/* Separator */}
          <div className="w-full h-px bg-border mb-6"></div>
          {/* Status aplikacji */}
          <div className="mb-6">
            <ApplicationStatus 
              application={application} 
              onStatusChange={onStatusChange}
            />
          </div>
          <div className="w-full h-px bg-border mb-6"></div>
          

          {/* Dolna sekcja - analiza i opis */}
          <div className="grid grid-cols-2 h-[calc(100%-220px)]">
            {/* Lewa kolumna - analiza */}
            <div className="pr-1">
              <JobAnalysis 
                application={application} 
                isDesktop={isDesktop} 
                onKeywordsFound={setFoundKeywords}
              />
            </div>

            {/* Prawa kolumna - opis i notatki */}
            <div className="pl-1 flex flex-col h-full">
              {/* Opis stanowiska - 70% wysokości */}
              <div className="flex-1" style={{ height: '70%' }}>
                <JobDescription 
                  application={application} 
                  isDesktop={isDesktop} 
                  keywords={foundKeywords}
                />
              </div>

              {/* Notatki - 30% wysokości */}
              <div style={{ height: '30%' }}>
                <Notes application={application} isDesktop={isDesktop} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose} direction="right">
        <DrawerContent className="w-[1100px] !max-w-[1100px] bg-white dark:bg-background ml-auto h-full overflow-hidden flex flex-col">
          <DrawerHeader className="border-b pb-4  z-10 flex flex-row items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold ml-2">{application.position}</DrawerTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Usuń
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                Zamknij
              </Button>
            </div>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[92vh] overflow-hidden flex flex-col sm:max-w-[95vw] max-w-[98vw]">
        <DialogHeader className="pb-0 pt-2 z-10 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold ml-2">{application.position}</DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Usuń
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden py-0">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  )
} 