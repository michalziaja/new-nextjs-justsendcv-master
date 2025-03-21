//app/components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"


export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (

      <Button
        variant="link"
        size="icon"
        className="relative overflow-hidden h-10 w-10 transition-transform duration-300 hover:scale-135 active:scale-105 dark:text-cyan-500"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-10 w-10 rotate-0 scale-100 transition-transform duration-500 dark:-rotate-180 dark:scale-0" />
        <Moon className="absolute h-10 w-10 rotate-180 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Przełącz motyw</span>
      </Button>
  
  )
} 