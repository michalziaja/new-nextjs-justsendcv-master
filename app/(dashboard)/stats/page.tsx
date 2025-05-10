"use client"

import React from "react"
import { StatsProvider } from "@/components/stats/StatsContext"
import { StatsContainer } from "@/components/stats/StatsContainer"

// Główna strona statystyk - używa kontekstu StatsProvider do zarządzania danymi
// Cała logika pobierania danych jest umieszczona w StatsContext.tsx, a layout w StatsContainer.tsx
export default function StatsPage() {
  return (
    <StatsProvider>
      <StatsContainer />
    </StatsProvider>
  )
}
