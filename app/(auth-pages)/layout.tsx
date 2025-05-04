"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex text-foreground">
      {/* Lewa kolumna z grafiką - widoczna tylko na dużych ekranach */}
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-gray-300/80 dark:border-gray-800 bg-gradient-to-r from-gray-100 via-cyan-50/50 to-gray-100 dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center p-12 z-10">
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-6 drop-shadow-lg">
              <Image 
                src="/logo.png" 
                alt="JustSend.cv Logo" 
                width={192}
                height={192}
                className="relative w-full h-full transition-transform hover:scale-105" 
              />
            </div>
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-gray-900 dark:text-white">Witaj w </span>
              <span className="text-[#00B2FF] drop-shadow-md">JustSend</span>
              <span className="text-gray-900 dark:text-white">.</span>
              <span className="text-[#00B2FF] drop-shadow-md">cv</span>

              {/* <span className="text-gray-900 dark:text-white drop-shadow-2xl">Just</span>
              <span className="text-[#00B2FF] drop-shadow-2xl">Send</span>
              <span className="text-gray-900 dark:text-white drop-shadow-2xl">.</span>
              <span className="text-[#00B2FF] drop-shadow-2xl">cv</span> */}
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Twoje miejsce do efektywnego zarządzania karierą i aplikacjami o pracę
            </p>
          </div>
        </div>

        {/* Dodatkowe elementy graficzne dla dużych ekranów */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-20 right-30 w-40 h-40 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-3xl" />
          <div className="absolute top-1/4 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-600/50 to-transparent dark:via-cyan-500/30" />
          <div className="absolute bottom-1/3 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-cyan-600/50 to-transparent dark:via-blue-500/30" />
          <div className="absolute top-20 right-32 w-16 h-16 rotate-45 border border-gray-300/80 dark:border-cyan-500/10" />
          <div className="absolute bottom-32 left-20 w-24 h-24 rotate-45 border border-gray-300/80 dark:border-cyan-500/10" />
        </div>

        <Link 
          href="/"
          className="absolute bottom-10 right-10 inline-flex items-center text-sm sm:text-base text-muted-foreground hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors hover:scale-105 z-20"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Powrót do strony głównej
        </Link>
      </div>

      {/* Prawa kolumna z formularzem - widoczna na wszystkich ekranach */}
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-4 relative bg-gray-100 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Sekcja widoczna tylko na małych ekranach */}
        <div className="lg:hidden relative w-full flex flex-col items-center justify-center">
          {/* Logo i napis na małych ekranach */}
          <div className="flex items-center justify-center gap-3 mb-8 z-10">
            <div className="relative w-12 h-12">
              <Image 
                src="/logo.png" 
                alt="JustSend.cv Logo" 
                width={48}
                height={48}
                className="relative w-full h-full" 
              />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="text-gray-900 dark:text-white">Witaj w </span>
              <span className="text-[#00B2FF] drop-shadow-md">JustSend</span>
              <span className="text-gray-900 dark:text-white">.</span>
              <span className="text-[#00B2FF] drop-shadow-md">cv</span>
            </h2>
          </div>

          {/* Dekoracyjne elementy dla małych ekranów */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-15 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent dark:via-cyan-500/30" />
            <div className="absolute bottom-10 right-0 w-1/2 h-px bg-gradient-to-l from-transparent via-gray-600/50 to-transparent dark:via-blue-500/30" />
            
            <div className="absolute top-56 left-0 w-10 h-10 rotate-45 border border-gray-300/50 dark:border-cyan-500/20 opacity-80" />
            
            <div className="absolute bottom-50 right-0 w-12 h-12 rotate-45 border border-gray-300/50 dark:border-cyan-500/20 opacity-80" />
            <div className="absolute top-1/4 right-10 w-8 h-8 rotate-45 border border-gray-300/50 dark:border-cyan-500/20 opacity-80" />
          </div>

          {/* Formularz na małych ekranach */}
          <div className="w-full max-w-md rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0F1C] shadow-lg p-8 relative z-10">
            {/* Usunięto poświatę i dostosowano tło formularza */}
            {children}
          </div>

          {/* Link powrotu na małych ekranach */}
          <div className="mt-8 z-10">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do strony głównej
            </Link>
          </div>
        </div>

        {/* Sekcja widoczna na dużych ekranach */}
        <div className="hidden lg:flex w-full max-w-md rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0F1C] shadow-lg p-8 relative">
          {/* Usunięto poświatę i dostosowano tło formularza */}
          {children}
        </div>
      </div>
    </div>
  )
}