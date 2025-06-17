import { useState, useEffect } from "react"

interface CountdownConfig {
  /** Data docelowa w formacie ISO string lub Date */
  targetDate: string | Date
  /** Czy licznik ma być aktywny */
  enabled: boolean
}

interface CountdownResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  timeString: string
}

/**
 * Hook do obsługi licznika czasu do uruchomienia aplikacji
 * 
 * AKTYWACJA LICZNIKA:
 * 1. Ustaw targetDate na datę uruchomienia
 * 2. Zmień enabled na true
 * 3. W WaitlistPopup.tsx usuń klasę "hidden" z #countdown-container
 */
export function useCountdown({ targetDate, enabled }: CountdownConfig): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<CountdownResult>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    timeString: ""
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    const calculateTimeLeft = () => {
      const target = new Date(targetDate)
      const now = new Date()
      const difference = target.getTime() - now.getTime()

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          timeString: "Aplikacja została uruchomiona!"
        }
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      // Formatowanie tekstu
      let timeString = ""
      if (days > 0) timeString += `${days} dni${days === 1 ? "" : ""}, `
      if (hours > 0) timeString += `${hours} godz, `
      if (minutes > 0) timeString += `${minutes} min`
      
      // Jeśli zostało mniej niż godzina, pokaż sekundy
      if (days === 0 && hours === 0) {
        timeString = `${minutes} min, ${seconds} sek`
      }

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        timeString: timeString.replace(/, $/, "") // Usuń ostatni przecinek
      }
    }

    // Oblicz czas od razu
    setTimeLeft(calculateTimeLeft())

    // Aktualizuj co sekundę
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, enabled])

  return timeLeft
}

// PRZYKŁAD UŻYCIA:
// const countdown = useCountdown({
//   targetDate: "2024-12-31T00:00:00Z", // Data uruchomienia
//   enabled: true // Włącz licznik
// })

// INSTRUKCJE AKTYWACJI:
// 1. W WaitlistPopup.tsx znajdź #countdown-container
// 2. Usuń klasę "hidden" 
// 3. Dodaj useCountdown hook
// 4. Ustaw datę uruchomienia aplikacji 