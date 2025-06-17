"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, AlertCircle, Timer } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"

/**
 * Stała sekcja z informacją o liście oczekujących
 * Zastępuje wyskakujące okienko
 */
export function WaitlistSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  const supabase = createClient()

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
          source: 'landing_section'
        })

      if (error) {
        // Sprawdź czy to błąd duplikatu
        if (error.code === '23505') {
          throw new Error("Ten adres email jest już na liście oczekujących!")
        }
        throw new Error("Wystąpił błąd podczas zapisywania. Spróbuj ponownie.")
      }

      setStatus('success')
      setEmail("") // Wyczyść formularz po sukcesie

    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || "Wystąpił nieoczekiwany błąd")
    } finally {
      setIsLoading(false)
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="w-full py-16 px-4  border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto mt-16 max-w-4xl">
        <div className="bg-white dark:bg-[#0A0F1C] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 md:p-12">
          
          {/* Logo i nagłówek */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="relative w-20 h-20">
                <Image
                  src="/logo.png"
                  alt="JustSend.cv Logo"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-900 dark:text-white">Witaj w </span>
              <span className="text-[#00B2FF] drop-shadow-md">JustSend</span>
              <span className="text-gray-900 dark:text-white">.</span>
              <span className="text-[#00B2FF] drop-shadow-md">cv</span>
            </h2>
            
            {/* Miejsce na licznik - obecnie ukryte, gotowe na przyszłość */}
            <div className="hidden mb-8" id="countdown-container">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#00B2FF]/10 to-blue-600/10 rounded-lg p-4 border border-[#00B2FF]/20 max-w-md mx-auto"
              >
                <Timer className="h-6 w-6 text-[#00B2FF]" />
                <div className="text-center">
                  <div className="text-[#00B2FF] font-bold text-xl">
                    7 dni, 12 godz, 30 min
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    do uruchomienia platformy
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-6">
              {/* <div className="p-3 bg-gradient-to-r from-[#00B2FF] to-blue-600 rounded-full shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div> */}
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Bądź pierwszym, który się dowie!
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto text-lg leading-relaxed mb-8">
              Nasza platforma wkrótce zostanie uruchomiona! 
              Dołącz do listy oczekujących i otrzymaj powiadomienie email w dniu startu aplikacji.
            </p>
          </div>

          {/* Formularz lub komunikat sukcesu/błędu */}
          <div className="max-w-md mx-auto">
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
                    className="w-full text-lg py-6 px-4 border border-gray-400 dark:border-gray-800 text-center"
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

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-[#00B2FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
              </form>
            )}
          </div>

          {/* Dodatkowe informacje */}
          {status !== 'success' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center max-w-lg mx-auto">
              Nie wysyłamy spamu. Otrzymasz tylko powiadomienie o starcie aplikacji oraz 
              okazjonalne informacje o nowych funkcjach.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  )
} 