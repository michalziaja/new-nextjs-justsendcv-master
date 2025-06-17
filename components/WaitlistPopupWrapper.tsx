"use client"

import { WaitlistPopup } from "./WaitlistPopup"
import { useWaitlistPopup } from "@/hooks/use-waitlist-popup"

interface WaitlistPopupWrapperProps {
  /** Typ strony: 'landing' | 'auth' */
  pageType: 'landing' | 'auth'
  /** Opcjonalne nadpisanie opóźnienia */
  delayMs?: number
}

/**
 * Wrapper komponent dla WaitlistPopup z łatwą konfiguracją
 * 
 * COFNIĘCIE ZMIAN:
 * - Usuń ten komponent ze stron/layoutów
 * - Lub ustaw enableOnAuthPages: false w hooks/use-waitlist-popup.ts
 */
export function WaitlistPopupWrapper({ pageType, delayMs }: WaitlistPopupWrapperProps) {
  const { shouldShowPopup, setShouldShowPopup, config } = useWaitlistPopup({
    pageType,
    customConfig: delayMs ? { delayMs } : undefined
  })

  if (!shouldShowPopup) {
    return null
  }

  return (
    <WaitlistPopup
      delayMs={0} // Hook już obsłużył delay
      oncePerSession={config.oncePerSession}
    />
  )
} 