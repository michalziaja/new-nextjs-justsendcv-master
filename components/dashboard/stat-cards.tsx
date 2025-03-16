"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, FileText, Mail, PhoneCall, Send, X } from "lucide-react"

// Komponent karty statystyk
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  borderColor: string;
  darkBorderColor: string;
}

function StatCard({ title, value, description, icon, borderColor, darkBorderColor }: StatCardProps) {
  return (
    <Card className={`
      border-1 border-gray-300 dark:border-gray-800 
      ${borderColor} ${darkBorderColor}
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)] 
      dark:shadow-slate-900/20
      bg-white dark:bg-slate-900
      transition-all duration-100
      gap-2 rounded-md
    `}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-sm md:text-base lg:text-base xl:text-base">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-md md:text-2xl lg:text-2xl xl:text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground hidden min-[700px]:block">{description}</p>
      </CardContent>
    </Card>
  )
}

export function StatCards() {
  return (
    <div className="grid gap-4 sm:gap-4 md:gap-4 lg:gap-4 xl:gap-6 grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 ">
      <StatCard 
        title="Zapisane" 
        value="12" 
        description="Zapisane oferty"
        icon={<FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />}
        borderColor="border-t-blue-500"
        darkBorderColor="dark:border-t-blue-400"
      />
      <StatCard 
        title="Wysłane" 
        value="8" 
        description="Aplikacje wysłane"
        icon={<Send className="h-6 w-6 text-purple-500 dark:text-purple-400" />}
        borderColor="border-t-purple-500"
        darkBorderColor="dark:border-t-purple-400"
      />
      <StatCard 
        title="Kontakt" 
        value="5" 
        description="Kontakt od HR"
        icon={<Mail className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />}
        borderColor="border-t-yellow-500"
        darkBorderColor="dark:border-t-yellow-400"
      />
      <StatCard 
        title="Rozmowa" 
        value="3" 
        description="Umówione rozmowy"
        icon={<PhoneCall className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />}
        borderColor="border-t-cyan-500"
        darkBorderColor="dark:border-t-cyan-400"
      />
      <StatCard 
        title="Oferta" 
        value="1" 
        description="Otrzymane oferty"
        icon={<ClipboardList className="h-6 w-6 text-green-500 dark:text-green-400" />}
        borderColor="border-t-green-500"
        darkBorderColor="dark:border-t-green-400"
      />
      <StatCard 
        title="Odmowa" 
        value="2" 
        description="Odmowy"
        icon={<X className="h-6 w-6 text-red-500 dark:text-red-400" />}
        borderColor="border-t-red-500"
        darkBorderColor="dark:border-t-red-400"
      />
    </div>
  )
} 