"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function ExperienceForm() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-3">Doświadczenie zawodowe</h3>
        <div className="space-y-4">
          {/* Pierwszy wpis */}
          <div className="space-y-4 border-b pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp1-title">Stanowisko</Label>
                <Input id="exp1-title" defaultValue="Senior Frontend Developer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp1-company">Firma</Label>
                <Input id="exp1-company" defaultValue="Tech Solutions Sp. z o.o." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp1-start">Data rozpoczęcia</Label>
                <Input id="exp1-start" defaultValue="2021" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp1-end">Data zakończenia</Label>
                <Input id="exp1-end" defaultValue="obecnie" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp1-desc">Opis</Label>
              <Textarea id="exp1-desc" defaultValue="Projektowanie i implementacja interfejsów użytkownika dla aplikacji webowych." />
            </div>
          </div>

          {/* Drugi wpis */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp2-title">Stanowisko</Label>
                <Input id="exp2-title" defaultValue="Frontend Developer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp2-company">Firma</Label>
                <Input id="exp2-company" defaultValue="Software House" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp2-start">Data rozpoczęcia</Label>
                <Input id="exp2-start" defaultValue="2019" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp2-end">Data zakończenia</Label>
                <Input id="exp2-end" defaultValue="2021" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp2-desc">Opis</Label>
              <Textarea id="exp2-desc" defaultValue="Rozwój aplikacji React, optymalizacja wydajności." />
            </div>
          </div>

          <Button type="button" variant="outline" size="sm" className="w-full mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj kolejne doświadczenie
          </Button>
        </div>
      </div>
    </div>
  )
}