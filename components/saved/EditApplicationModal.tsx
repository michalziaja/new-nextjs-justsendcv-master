"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mockApplications } from "./mockData"

interface EditApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  application: typeof mockApplications[0] | null
}

export function EditApplicationModal({
  isOpen,
  onClose,
  application
}: EditApplicationModalProps) {
  if (!application) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edytuj aplikację</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {/* Tu dodamy formularz edycji */}
          <div className="space-y-4">
            <p>Formularz edycji w przygotowaniu...</p>
            <Button 
              className="w-full"
              onClick={onClose}
            >
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 