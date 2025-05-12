import { createModel, logTokenUsage } from "./gemini-client";

// Instrukcja systemowa dla modelu
const SYSTEM_INSTRUCTION = 
  "Jesteś ekspertem w redagowaniu profesjonalnych opisów profili zawodowych w CV. " +
  "Twoje opisy są zwięzłe, konkretne i podkreślają najważniejsze umiejętności oraz doświadczenie kandydata. " +
  "Dostosowujesz styl i zawartość do specyfiki stanowiska i branży. " +
  "Zawsze piszesz w pierwszej osobie z perspektywy kandydata. " +
  "Twój opis zawiera 3-5 zdań i podkreśla to, co najważniejsze dla pracodawcy.";

/**
 * Generuje profesjonalny opis profilu zawodowego dla CV
 * 
 * @param jobTitle - Nazwa stanowiska na które aplikuje użytkownik
 * @param userDescription - Obecny opis wprowadzony przez użytkownika (opcjonalny)
 * @param experience - Doświadczenie zawodowe użytkownika (opcjonalne)
 * @param skills - Umiejętności użytkownika (opcjonalne)
 * @returns Wygenerowany opis profilu
 */
export async function generateProfileDescription(
  jobTitle: string, 
  userDescription?: string, 
  experience?: any[], 
  skills?: { technical?: string[], soft?: string[], languages?: {language: string, level: string}[] }
) {
  console.log(`📝 ProfileGenerator: Generowanie opisu dla stanowiska: ${jobTitle}`);
  
  try {
    // Utworzenie modelu
    console.log("🤖 ProfileGenerator: Tworzenie modelu Gemini");
    const model = createModel("gemini-1.5-flash", SYSTEM_INSTRUCTION);
    
    // Przygotowanie danych o doświadczeniu
    let experienceText = "";
    if (experience && experience.length > 0) {
      experienceText = "Moje doświadczenie zawodowe:\n" + 
        experience.map(exp => 
          `- ${exp.position || 'Stanowisko'} w ${exp.company || 'Firma'}, ${exp.startDate || ''} - ${exp.endDate || 'obecnie'}`
        ).join("\n");
    }
    
    // Przygotowanie danych o umiejętnościach
    let skillsText = "";
    if (skills) {
      if (skills.technical && skills.technical.length > 0) {
        skillsText += "Umiejętności techniczne: " + skills.technical.join(", ") + "\n";
      }
      if (skills.soft && skills.soft.length > 0) {
        skillsText += "Umiejętności miękkie: " + skills.soft.join(", ") + "\n";
      }
      if (skills.languages && skills.languages.length > 0) {
        skillsText += "Znajomość języków: " + 
          skills.languages.map(lang => `${lang.language} (${lang.level})`).join(", ") + "\n";
      }
    }
    
    // Przygotowanie promptu
    const userPrompt = `
Napisz profesjonalny opis profilu zawodowego do CV dla stanowiska: ${jobTitle}

${userDescription ? `Obecny opis użytkownika (inspiracja):
"""
${userDescription}
"""` : ''}

${experienceText ? experienceText : ''}

${skillsText ? skillsText : ''}

Wytyczne:
- Napisz 3-5 zwięzłych zdań w pierwszej osobie
- Podkreśl najważniejsze umiejętności i doświadczenie pasujące do stanowiska
- Unikaj pustych frazesów i ogólników
- Skup się na wartości, jaką kandydat wniesie do firmy
- Użyj słów kluczowych istotnych w danej branży/stanowisku
- Nie powtarzaj tego samego co w obecnym opisie, tylko ulepsz go
- Odpowiedź napisz po polsku
- Zwróć tylko sam opis bez dodatkowych komentarzy i wyjaśnień
`;

    // Wywołanie modelu
    console.log("🔄 ProfileGenerator: Wysyłanie zapytania do Gemini...");
    const startTime = Date.now();
    
    try {
      const response = await model.generateContent(userPrompt);
      const endTime = Date.now();
      const elapsedTime = (endTime - startTime) / 1000;
      console.log(`✅ ProfileGenerator: Otrzymano odpowiedź z Gemini (czas: ${elapsedTime}s)`);
      
      const generatedDescription = response.response.text().trim();
      
      if (!generatedDescription || generatedDescription.length === 0) {
        throw new Error("Otrzymano pustą odpowiedź od modelu");
      }
      
      // Logowanie tokenów
      logTokenUsage(response.response);
      
      return generatedDescription;
      
    } catch (modelError) {
      console.error("❌ ProfileGenerator: Błąd generowania treści przez model:", modelError);
      
      // Obsługa błędów związanych z limitami
      const errorMessage = String(modelError);
      if (errorMessage.toLowerCase().includes("token") || 
          errorMessage.toLowerCase().includes("limit") || 
          errorMessage.toLowerCase().includes("quota")) {
        throw new Error("Przekroczono limit tokenów lub osiągnięto limit zapytań API. Proszę spróbować później.");
      }
      
      throw modelError;
    }
  } catch (error) {
    console.error("❌ ProfileGenerator: Błąd generowania opisu:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Nieznany błąd";
    throw new Error(`Nie udało się wygenerować opisu profilu: ${errorMessage}`);
  }
} 