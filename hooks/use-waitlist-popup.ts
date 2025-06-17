import { useState, useEffect } from "react"

// KONFIGURACJA POPUP-A - ŁATWE WŁĄCZANIE/WYŁĄCZANIE
// Zmień wartości na false, aby wyłączyć popup na danej stronie
const WAITLIST_CONFIG = {
  // Czy popup ma być aktywny na stronie głównej
  enableOnLandingPage: true,
  // Czy popup ma być aktywny na stronach autoryzacji (login/register)
  enableOnAuthPages: true,
  // Opóźnienie w milisekundach
  delayMs: 10000,
  // Czy tylko raz na sesję
  oncePerSession: true,
}

interface UseWaitlistPopupProps {
  /** Typ strony: 'landing' | 'auth' */
  pageType: 'landing' | 'auth'
  /** Opcjonalne nadpisanie konfiguracji */
  customConfig?: Partial<typeof WAITLIST_CONFIG>
}

export function useWaitlistPopup({ pageType, customConfig }: UseWaitlistPopupProps) {
  const [shouldShowPopup, setShouldShowPopup] = useState(false)
  
  // Scal konfigurację domyślną z opcjonalną niestandardową
  const config = { ...WAITLIST_CONFIG, ...customConfig }
  
  useEffect(() => {
    // Sprawdź czy popup jest włączony dla tego typu strony
    const isEnabled = pageType === 'landing' 
      ? config.enableOnLandingPage 
      : config.enableOnAuthPages
    
    if (!isEnabled) {
      return
    }
    
    // Sprawdź czy popup już był pokazany w tej sesji
    if (config.oncePerSession && sessionStorage.getItem('waitlist_popup_shown')) {
      return
    }
    
    // Sprawdź czy użytkownik już zamknął popup w localStorage
    if (localStorage.getItem('waitlist_popup_dismissed')) {
      return
    }
    
    // Ustaw timer do pokazania popupu
    const timer = setTimeout(() => {
      setShouldShowPopup(true)
      if (config.oncePerSession) {
        sessionStorage.setItem('waitlist_popup_shown', 'true')
      }
    }, config.delayMs)
    
    return () => clearTimeout(timer)
  }, [pageType, config])
  
  return {
    shouldShowPopup,
    setShouldShowPopup,
    config
  }
}

// INSTRUKCJE DLA COFNIĘCIA ZMIAN:
// 1. Ustaw `enableOnAuthPages: false` w WAITLIST_CONFIG powyżej
// 2. Lub usuń komponenty WaitlistPopup z layoutu/stron
// 3. Lub usuń cały ten plik i importy 