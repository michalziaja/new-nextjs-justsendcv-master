import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit2 } from "lucide-react"
import * as React from "react"
import { createClient } from "@/utils/supabase/client"
import { JobOffer } from "../saved/ApplicationDetailsDrawer"

interface NotesProps {
  application: JobOffer
  isDesktop: boolean
}

export function Notes({ application, isDesktop }: NotesProps) {
  return (
    <div className="h-full">
      <Textarea 
        placeholder="Dodaj swoje notatki..."
        className="h-[calc(94%-5.5rem)] resize-none mb-2"
      />
      <div className="flex gap-2 justify-end mt-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Dodaj
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Edit2 className="h-4 w-4" />
          Edytuj
        </Button>
      </div>
    </div>
  )
} 
