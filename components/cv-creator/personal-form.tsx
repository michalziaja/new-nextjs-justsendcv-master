"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function PersonalForm() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-3">Dane podstawowe</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię</Label>
              <Input id="firstName" defaultValue="Jan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input id="lastName" defaultValue="Kowalski" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Stanowisko</Label>
            <Input id="position" defaultValue="Senior Frontend Developer" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Podsumowanie zawodowe</Label>
            <Textarea 
              id="summary" 
              defaultValue="Doświadczony Frontend Developer z 5-letnim doświadczeniem w tworzeniu responsywnych interfejsów użytkownika."
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-3">Dane kontaktowe</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="jan.kowalski@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" type="tel" defaultValue="+48 123 456 789" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Miasto</Label>
              <Input id="city" defaultValue="Warszawa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Kraj</Label>
              <Input id="country" defaultValue="Polska" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-3">Social media</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" type="url" defaultValue="https://linkedin.com/in/jankowalski" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input id="github" type="url" defaultValue="https://github.com/jankowalski" />
          </div>

          <Button type="button" variant="outline" size="sm" className="w-full mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj więcej linków
          </Button>
        </div>
      </div>
    </div>
  )
}