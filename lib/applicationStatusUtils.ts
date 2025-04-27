// lib/applicationStatusUtils.ts
import { BookmarkIcon, SendIcon, PhoneIcon, UsersIcon, CheckIcon, XIcon } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { ApplicationStatus as ApplicationStatusType } from "@/components/saved/SavedTableTabs"

// Mapy statusów (bez zmian)
export const statusMapENtoPL = { saved: 'zapisana', send: 'wysłana', contact: 'kontakt', interview: 'rozmowa', offer: 'oferta', rejected: 'odmowa' } as const;
export const statusMapPLtoEN = { zapisana: 'saved', wysłana: 'send', kontakt: 'contact', rozmowa: 'interview', oferta: 'offer', odmowa: 'rejected' } as const;

// Kroki statusu (bez zmian)
export const statusSteps = [
  { status: 'zapisana' as const, icon: BookmarkIcon, index: 0 }, // Dodajmy index dla łatwiejszego porównywania
  { status: 'wysłana' as const, icon: SendIcon, index: 1 },
  { status: 'kontakt' as const, icon: PhoneIcon, index: 2 },
  { status: 'rozmowa' as const, icon: UsersIcon, index: 3 },
  { status: 'oferta' as const, icon: CheckIcon, index: 4 },
  { status: 'odmowa' as const, icon: XIcon, index: 5 } // Odmowa ma swój index, ale logika w UI traktuje ją specjalnie
] as const;

// Typ StatusHistory (bez zmian)
export interface StatusHistory { status: ApplicationStatusType; date: string; }

// Funkcja parsowania (bez zmian)
export const parseStatusHistory = (statusChanges: string[] | null): StatusHistory[] => {
    // ... (bez zmian - upewnij się, że obsługa błędów daty jest wystarczająca)
    if (!statusChanges || statusChanges.length === 0) return [];
    return statusChanges.map(entry => {
        const parts = entry.split('-');
        if (parts.length < 2) { console.error("Nieprawidłowy format wpisu:", entry); return { status: 'zapisana', date: '' }; }
        const status = parts[0];
        const dateTime = parts.slice(1).join('-');
        const plStatus = statusMapENtoPL[status as keyof typeof statusMapENtoPL] || 'zapisana';
        let formattedDate = "Błąd daty"; // Default
        try {
            const date = new Date(dateTime);
            if (!isNaN(date.getTime())) { formattedDate = date.toLocaleDateString('pl-PL'); }
            else { console.warn("Nieprawidłowa data w historii:", dateTime); formattedDate = "Nieznana data"; }
        } catch (error) { console.error("Błąd formatowania daty:", error); }
        return { status: plStatus, date: formattedDate };
    });
};


// ZAKTUALIZOWANA Funkcja aktualizacji statusu
export const updateApplicationStatus = async (
  applicationId: string,
  newStatusPL: ApplicationStatusType,
  removeSubsequentStatuses: boolean = false
): Promise<{ success: boolean; updatedHistory?: StatusHistory[]; error?: any }> => {
  try {
    const supabase = createClient();
    const dbStatus = newStatusPL !== 'wszystkie' 
      ? statusMapPLtoEN[newStatusPL as keyof typeof statusMapPLtoEN]
      : 'saved'; // Domyślny status, gdyby z jakiegoś powodu przekazano 'wszystkie'
    
    if (!dbStatus) throw new Error(`Nieznany status: ${newStatusPL}`);
    const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const { data: currentData, error: fetchError } = await supabase
      .from('job_offers')
      .select('status_changes')
      .eq('id', applicationId)
      .single();

    if (fetchError) return { success: false, error: fetchError };

    let currentHistoryEntries: string[] = currentData?.status_changes || [];
    let finalHistory: string[] = [];

    if (removeSubsequentStatuses) {
      // --- UPROSZCZONA LOGIKA CZYSZCZENIA ---
      const newStatusIndex = statusSteps.find(s => s.status === newStatusPL)?.index ?? -1;
      if (newStatusIndex === -1) throw new Error(`Nie znaleziono indeksu dla statusu: ${newStatusPL}`);

      if (dbStatus === 'saved') {
        // Specjalny przypadek: Cofnięcie do 'saved' - zachowaj tylko pierwszy wpis 'saved'
        const firstSavedEntry = currentHistoryEntries.find(entry => entry.startsWith('saved-'));
        finalHistory = firstSavedEntry ? [firstSavedEntry] : [];
      } else {
        // Dla pozostałych statusów - najprostsze podejście zgodnie z wymaganiami:
        // 1. Filtrujemy wpisy, zachowując tylko te o statusie mniejszym lub równym temu, do którego cofamy
        finalHistory = currentHistoryEntries.filter(entry => {
          const entryStatusEN = entry.split('-')[0];
          if (!entryStatusEN) return false;
          
          // Znajdź indeks dla tego statusu
          const entryStatusPL = statusMapENtoPL[entryStatusEN as keyof typeof statusMapENtoPL];
          if (!entryStatusPL) return false;
          
          const entryIndex = statusSteps.find(s => s.status === entryStatusPL)?.index ?? -1;
          if (entryIndex === -1) return false;
          
          // Zachowaj tylko wpisy o indeksie <= niż indeks statusu, do którego cofamy
          return entryIndex <= newStatusIndex;
        });
        
        // 2. Sprawdź, czy w odfiltrowanej historii istnieje wpis o statusie, do którego cofamy
        const hasTargetStatusEntry = finalHistory.some(entry => entry.startsWith(dbStatus + '-'));
        
        // 3. Jeśli nie ma wpisu o statusie, do którego cofamy, dodaj go
        if (!hasTargetStatusEntry) {
          finalHistory.push(`${dbStatus}-${currentDateTime}`);
        }
      }
    } else {
      // --- Logika dla zmiany statusu BEZ cofania (bez zmian) ---
      finalHistory = [...currentHistoryEntries]; // Kopiuj aktualną historię
      const newEntry = `${dbStatus}-${currentDateTime}`;
      const existingIndex = finalHistory.findIndex(entry => entry.startsWith(dbStatus + '-'));

      if (existingIndex !== -1) {
        // Aktualizuj istniejący wpis (chyba że to 'saved' - wtedy nie zmieniamy daty)
        if (dbStatus !== 'saved') {
          finalHistory[existingIndex] = newEntry;
        }
      } else {
        // Dodaj nowy wpis
        finalHistory.push(newEntry);
      }
    }

    // --- Aktualizacja bazy danych ---
    const { error: updateError } = await supabase
      .from('job_offers')
      .update({
        status: dbStatus, // Zawsze aktualizuj główny status
        status_changes: finalHistory // Zapisz przefiltrowaną/zaktualizowaną historię
      })
      .eq('id', applicationId);

    if (updateError) return { success: false, error: updateError };

    // --- Zwracanie wyniku ---
    // Ponownie parsujemy i sortujemy finalną historię zapisaną w bazie
    const finalHistoryParsed = parseStatusHistory(finalHistory);
    const sortedHistory = [...finalHistoryParsed].sort((a, b) => {
      // Logika sortowania dat PL (bez zmian)
      const parseDatePL = (dateStr: string): Date => {
        if (!dateStr || dateStr.includes("Nieznana") || dateStr.includes("Błąd")) return new Date(0);
        const parts = dateStr.split('.');
        return parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date(0);
      };
      return parseDatePL(a.date).getTime() - parseDatePL(b.date).getTime();
    });

    return { success: true, updatedHistory: sortedHistory };

  } catch (error) {
    console.error("Wystąpił błąd podczas updateApplicationStatus:", error);
    return { success: false, error };
  }
};