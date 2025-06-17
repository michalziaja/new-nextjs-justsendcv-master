"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, CheckCircle, AlertCircle, Timer } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"

interface WaitlistPopupProps {
  /** Czas w milisekundach po którym popup się pojawi (domyślnie 10 sekund) */
  delayMs?: number
  /** Czy popup ma się pojawić tylko raz na sesję */
  oncePerSession?: boolean
}

export function WaitlistPopup({ delayMs = 10000, oncePerSession = true }: WaitlistPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  const supabase = createClient()

  useEffect(() => {
    // Sprawdź czy popup już był pokazany w tej sesji
    if (oncePerSession && sessionStorage.getItem('waitlist_popup_shown')) {
      return
    }

    // Sprawdź czy użytkownik już zamknął popup w localStorage
    if (localStorage.getItem('waitlist_popup_dismissed')) {
      return
    }

    // Ustaw timer do pokazania popupu
    const timer = setTimeout(() => {
      setIsOpen(true)
      if (oncePerSession) {
        sessionStorage.setItem('waitlist_popup_shown', 'true')
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [delayMs, oncePerSession])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')
    setErrorMessage("")

    try {
      // Walidacja email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("Proszę podać prawidłowy adres email")
      }

      // Zapisz email do bazy danych
      const { error } = await supabase
        .from('waitlist')
        .insert({
          email: email.toLowerCase().trim(),
          source: 'landing_popup'
        })

      if (error) {
        // Sprawdź czy to błąd duplikatu
        if (error.code === '23505') {
          throw new Error("Ten adres email jest już na liście oczekujących!")
        }
        throw new Error("Wystąpił błąd podczas zapisywania. Spróbuj ponownie.")
      }

      setStatus('success')
      
      // Automatically close popup after success
      setTimeout(() => {
        handleClose()
      }, 3000)

    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || "Wystąpił nieoczekiwany błąd")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Zapamiętaj że użytkownik zamknął popup
    localStorage.setItem('waitlist_popup_dismissed', 'true')
  }

  const handleNotNow = () => {
    setIsOpen(false)
    // Nie zapamiętuj w localStorage, żeby popup mógł się pojawić w następnej sesji
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header z możliwością zamknięcia */}
              <DialogHeader className="relative text-center">
                <button
                  onClick={handleClose}
                  className="absolute -top-2 -right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
                  aria-label="Zamknij"
                >
                  <X className="h-4 w-4" />
                </button>
                
                {/* Sekcja Logo + Tytuł */}
                <div className="text-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  {/* Logo w centrum */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="relative w-24 h-24 mx-auto"
                    >
                      <Image
                        src="/logo.png"
                        alt="JustSend.cv Logo"
                        fill
                        className="object-contain drop-shadow-lg"
                      />
                    </motion.div>
                  </div>
                  
                  {/* Główny tytuł - wyśrodkowany */}
                  <DialogTitle className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">
                    <span className="text-gray-900 dark:text-white">Witaj w </span>
                    <span className="text-[#00B2FF] drop-shadow-md">JustSend</span>
                    <span className="text-gray-900 dark:text-white">.</span>
                    <span className="text-[#00B2FF] drop-shadow-md">cv</span>
                  </DialogTitle>
                </div>
                
                {/* Miejsce na licznik - obecnie ukryte, gotowe na przyszłość */}
                <div className="hidden mb-8" id="countdown-container">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#00B2FF]/10 to-blue-600/10 rounded-lg p-4 border border-[#00B2FF]/20"
                  >
                    <Timer className="h-6 w-6 text-[#00B2FF]" />
                    <div className="text-center">
                      <div className="text-[#00B2FF] font-bold text-xl" id="countdown-timer">
                        {/* Miejsce na licznik - np: "7 dni, 12 godz, 30 min" */}
                        7 dni, 12 godz, 30 min
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        do uruchomienia platformy
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Podtytuł z ikoną */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-[#00B2FF] to-blue-600 rounded-full shadow-lg">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    Bądź pierwszym, który się dowie!
                  </span>
                </div>
                
                <DialogDescription className="text-gray-600 dark:text-gray-300 text-center max-w-lg mx-auto text-base leading-relaxed">
                  Nasza platforma wkrótce zostanie uruchomiona! 
                  Dołącz do listy oczekujących i otrzymaj powiadomienie email w dniu startu aplikacji.
                </DialogDescription>
              </DialogHeader>

              {/* Formularz lub komunikat sukcesu/błędu */}
              <div className="mt-8">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                  >
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Dziękujemy!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base">
                      Twój email został dodany do listy oczekujących. 
                      Powiadomimy Cię o starcie aplikacji!
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Input
                        type="email"
                        placeholder="Twój adres email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full text-lg py-6 px-4 text-center"
                        disabled={isLoading}
                      />
                      {status === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center gap-2 mt-3 text-red-600 text-sm"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errorMessage}
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={isLoading || !email}
                        className="flex-1 bg-gradient-to-r from-[#00B2FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          "Dołącz do listy oczekujących"
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleNotNow}
                        disabled={isLoading}
                        className="px-6 py-6 text-lg"
                      >
                        Nie teraz
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Dodatkowe informacje */}
              {status !== 'success' && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center max-w-md mx-auto">
                  Nie wysyłamy spamu. Otrzymasz tylko powiadomienie o starcie aplikacji oraz 
                  okazjonalne informacje o nowych funkcjach.
                </p>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
} 