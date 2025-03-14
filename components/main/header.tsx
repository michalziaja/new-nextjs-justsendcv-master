"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="JustSend.cv Logo" 
              className="h-10 w-auto" 
            />
            <span className="ml-2 text-2xl font-bold text-foreground">JustSend.cv</span>
          </Link>
        </motion.div> 

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
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="link"
              size="sm"
              className="text-gray-700 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF]"
            >
              Zaloguj się
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-[#00B2FF] hover:bg-[#00B2FF]/90 text-white"
            >
              Zarejestruj się
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 transition-transform duration-200 hover:scale-125 active:scale-90"
              onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

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
              <div className="flex flex-col space-y-2">
                <Button
                  variant="link"
                  className="text-gray-700 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] justify-start"
                >
                  Zaloguj się
                </Button>
                <Button
                  className="bg-[#00B2FF] hover:bg-[#00B2FF]/90 text-white w-full"
                >
                  Zarejestruj się
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

