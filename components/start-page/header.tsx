"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-3 right-3 z-50 shadow-sm rounded-sm border-1 border-gray-200 dark:bg-slate-900 dark:border-slate-800",
        isScrolled 
          ? "bg-white/70 dark:bg-[#0A0F1C]/80 backdrop-blur-sm shadow-md" 
          : "bg-white/70 dark:bg-[#0A0F1C]/80 mt-3 shadow-md",
      )}
    >
      <motion.div 
        className="container mx-auto px-2 py-0.5"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="JustSend.cv Logo" 
                className="h-8 w-auto mr-4 sm:h-8 lg:h-10 max-w-[30px] sm:max-w-[40px] lg:max-w-none transition-all" 
              />
              <div className="flex items-center">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold transition-all text-gray-900 dark:text-white">JustSend</span>
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold transition-all text-[#00B2FF]">.</span>
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold transition-all text-gray-900 dark:text-white drop-shadow-md">cv</span>
              </div>
            </Link>
          </div>

          {/* Centered Navigation */}
          <div className="hidden md:flex-1 md:flex md:justify-center">
            <nav className="flex items-center space-x-10">
              <Link
                href="#features"
                className="text-gray-700 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors"
              >
                Funkcje
              </Link>
              <Link
                href="#pricing"
                className="text-gray-700 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors"
              >
                Cennik
              </Link>
              <Link
                href="#faq"
                className="text-gray-700 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Link href="/sign-in">
              <Button
                size="sm"
                className="bg-black rounded-lg dark:bg-white text-white dark:text-black hover:scale-110 transition-transform text-xs md:text-sm lg:text-base px-2 md:px-4 lg:px-6"
              >
                Zaloguj się
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#00B2FF] to-blue-600 rounded-lg hover:bg-[#00B2FF] text-white dark:text-black hover:scale-110 transition-transform text-xs md:text-sm lg:text-base px-2 md:px-4 lg:px-6"
              >
                <span className="relative z-10">Zarejestruj się</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-gray-700 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Funkcje
              </Link>
              <Link
                href="#pricing"
                className="text-gray-700 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Cennik
              </Link>
              <Link
                href="#faq"
                className="text-gray-700 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-row space-x-2">
                <Link href="/sign-in" className="flex-1">
                  <Button
                    className="bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform w-full"
                  >
                    Zaloguj się
                  </Button>
                </Link>
                <Link href="/sign-up" className="flex-1">
                  <Button
                    className="bg-[#00B2FF] hover:bg-[#00B2FF] text-white dark:text-black hover:scale-105 transition-transform w-full"
                  >
                    <span className="relative z-10">Zarejestruj się</span>
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

