"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

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
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header z możliwością zamknięcia */}
              <DialogHeader className="relative">
                <button
                  onClick={handleClose}
                  className="absolute -top-2 -right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Zamknij"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 rounded-full">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Bądź pierwszym, który się dowie!
                  </DialogTitle>
                </div>
                
                <DialogDescription className="text-gray-600 dark:text-gray-300 text-left">
                  <span className="text-[#00B2FF] font-semibold">JustSend.cv</span> wkrótce zostanie uruchomiony! 
                  Dołącz do listy oczekujących i otrzymaj powiadomienie email w dniu startu aplikacji.
                </DialogDescription>
              </DialogHeader>

              {/* Formularz lub komunikat sukcesu/błędu */}
              <div className="mt-6">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Dziękujemy!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Twój email został dodany do listy oczekujących. 
                      Powiadomimy Cię o starcie aplikacji!
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Twój adres email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full"
                        disabled={isLoading}
                      />
                      {status === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 mt-2 text-red-600 text-sm"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errorMessage}
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isLoading || !email}
                        className="flex-1 bg-gradient-to-r from-[#00B2FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          "Dołącz do listy"
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleNotNow}
                        disabled={isLoading}
                        className="px-4"
                      >
                        Nie teraz
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Dodatkowe informacje */}
              {status !== 'success' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  Nie wysyłamy spamu. Otrzymasz tylko powiadomienie o starcie aplikacji.
                </p>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
} 