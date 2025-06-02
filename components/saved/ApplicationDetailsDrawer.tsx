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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { BasicInfo } from "@/components/drawer-sections/BasicInfo"
import { ApplicationStatus } from "@/components/drawer-sections/ApplicationStatus"
import { JobAnalysis } from "@/components/drawer-sections/JobAnalysis"
import { JobDescription } from "@/components/drawer-sections/JobDescription"
import { Notes } from "@/components/drawer-sections/Notes"
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { ApplicationStatus as ApplicationStatusType } from "./SavedTableTabs"

interface KeywordWithCategory {
  keyword: string
  category: 'industrySkills' | 'softSkills' | 'requirements' | 'benefits' | 'generalJobTerms'
}

interface ApplicationDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  application: JobOffer | null
  onEdit: () => void
  onDelete?: () => void
  onStatusChange?: (newStatus: ApplicationStatusType) => void
  onPriorityChange?: (newPriority: number) => void
  onNextApplication?: () => void
  onPreviousApplication?: () => void
  hasPreviousApplication?: boolean
  hasNextApplication?: boolean
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
  onPriorityChange,
  onNextApplication,
  onPreviousApplication,
  hasPreviousApplication = false,
  hasNextApplication = false
}: ApplicationDetailsDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 900px)")
  const [foundKeywords, setFoundKeywords] = useState<KeywordWithCategory[]>([])
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  
  if (!application) return null

  const handleDelete = () => {
    // Otwieramy dialog potwierdzenia
    setShowDeleteConfirmation(true)
    console.log("Wywołano handleDelete - pokazuję dialog potwierdzenia")
  }

  const confirmDelete = () => {
    console.log("Wywołano confirmDelete")
    // Upewniamy się, że funkcja onDelete istnieje
    if (onDelete) {
      console.log("Wywołuję onDelete")
      onDelete()
    } else {
      console.log("Brak funkcji onDelete!")
    }
    setShowDeleteConfirmation(false)
    // Zamykamy główny drawer po usunięciu
    onClose()
  }

  const cancelDelete = () => {
    setShowDeleteConfirmation(false)
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <div className={`${isDesktop ? 'px-4' : 'px-2'} py-2 h-full`}>
          {/* Górna sekcja - podstawowe informacje */}
          <div className="mb-8">
            <BasicInfo 
              application={application} 
              isDesktop={isDesktop} 
              onPriorityChange={onPriorityChange}
            />
          </div>
          {/* Separator */}
          {/* <div className="w-full h-px bg-gray-400 dark:bg-gray-700 mb-6"></div> */}
          {/* Status aplikacji */}
          <div className="mb-4">
            <ApplicationStatus 
              application={application} 
              onStatusChange={onStatusChange}
            />
          </div>
          <div className="w-full h-px bg-gray-400 dark:bg-gray-700 mb-6"></div>
          

          {/* Dolna sekcja - analiza i opis */}
          <div className="grid grid-cols-2 h-[calc(100%-220px)]">
            {/* Lewa kolumna - analiza */}
            <div className="pr-1">
              <JobAnalysis 
                application={application} 
                isDesktop={isDesktop} 
                
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

              
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Dialog potwierdzający usunięcie
  const deleteConfirmationDialog = (
    <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Potwierdź usunięcie</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć ofertę "{application.title}"? Tej operacji nie można cofnąć.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={cancelDelete}>Anuluj</Button>
          <Button variant="destructive" onClick={confirmDelete}>Usuń</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (isDesktop) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
          <DrawerContent className="w-[1100px] !max-w-[1100px] bg-white dark:bg-background ml-auto h-full overflow-hidden flex flex-col">
            <DrawerHeader className="pb-4 z-10 flex flex-row items-center justify-between">
              <div className="flex items-center">
                {/* Przycisk poprzednia oferta */}
                {hasPreviousApplication && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPreviousApplication}
                    className="mr-2"
                    title="Poprzednia oferta"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <DrawerTitle className="text-2xl font-semibold ml-2">{application.title}</DrawerTitle>
                {/* Przycisk następna oferta */}
                {hasNextApplication && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNextApplication}
                    className="ml-2"
                    title="Następna oferta"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
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
        {deleteConfirmationDialog}
      </>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] h-[92vh] overflow-hidden flex flex-col sm:max-w-[95vw] max-w-[98vw]">
          <DialogHeader className="pb-0 pt-2 z-10 flex flex-row items-center justify-between">
            <div className="flex items-center">
              {/* Przycisk poprzednia oferta */}
              {hasPreviousApplication && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPreviousApplication}
                  className="p-1 mr-1"
                  title="Poprzednia oferta"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <DialogTitle className="text-xl font-semibold ml-2">{application.title}</DialogTitle>
              {/* Przycisk następna oferta */}
              {hasNextApplication && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNextApplication}
                  className="p-1 ml-1"
                  title="Następna oferta"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
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
      {deleteConfirmationDialog}
    </>
  )
} 