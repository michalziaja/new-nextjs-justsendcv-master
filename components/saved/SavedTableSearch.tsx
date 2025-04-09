"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SavedTableSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SavedTableSearch({ searchQuery, onSearchChange }: SavedTableSearchProps) {
  return (
    <div className="relative w-45 sm:w-50 md:w-50 lg:w-50 xl:w-57 ml-0 border-0 bg-white dark:bg-sidebar shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border-cyan-500 dark:border-gray-700 rounded-md">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground " />
      <Input
        placeholder="Wyszukaj aplikacje..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8 text-xs md:text-sm lg:text-sm xl:text-sm"
      />
    </div>
  )
} 