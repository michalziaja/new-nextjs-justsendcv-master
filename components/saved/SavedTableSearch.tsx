"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SavedTableSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SavedTableSearch({ searchQuery, onSearchChange }: SavedTableSearchProps) {
  return (
    <div className="relative w-60 ml-1 border-1 border-gray-300 dark:border-gray-700 rounded-md">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground " />
      <Input
        placeholder="Wyszukaj aplikacje..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8"
      />
    </div>
  )
} 