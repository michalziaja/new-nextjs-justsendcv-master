// app/(landing)/page.tsx
"use client"
import { Header } from "@/components/start-page/header"
import StartPage from "@/components/start-page/main"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-[#0A0F1C]">
      <Header />
      <StartPage /> 
    </main>
  )
}
