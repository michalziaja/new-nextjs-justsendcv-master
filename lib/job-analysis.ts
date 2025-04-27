// lib/job-analysis.ts
import { createModel, logTokenUsage } from "./gemini-client";

// Systemowa instrukcja dla modelu
const SYSTEM_INSTRUCTION = 
  "Jesteś doświadczonym rekruterem HR z wieloletnim doświadczeniem w różnych branżach. " +
  "Twoim zadaniem jest analizowanie ofert pracy i wyodrębnianie kluczowych informacji: " +
  "umiejętności, technologii/narzędzi, doświadczenia, wykształcenia, języków i innych wymagań. " +
  "Analizujesz oferty z KAŻDEJ branży, nie tylko IT. Dla branży nieIT dostosuj kategorie odpowiednio. " +
  "Zwracaj wyniki zawsze w określonym formacie. Nie dodawaj nic od siebie.";

// Funkcja do analizy oferty pracy
export async function analyzeJobOffer(jobDescription: string) {
  console.log(`📋 JobAnalysis: Rozpoczęcie analizy oferty, długość tekstu: ${jobDescription.length} znaków`);
  
  // Sprawdzenie czy mamy co analizować
  if (!jobDescription || jobDescription.trim().length < 20) {
    console.error("❌ JobAnalysis: Opis oferty jest zbyt krótki lub pusty");
    throw new Error("Opis oferty jest zbyt krótki lub pusty");
  }
  
  try {
    // Utworzenie modelu
    console.log("🤖 JobAnalysis: Tworzenie modelu Gemini");
    const model = createModel("gemini-2.0-flash-lite", SYSTEM_INSTRUCTION);
    
    // Prompt użytkownika
    const userPrompt = `
Zanalizuj poniższą ofertę pracy i wypisz w osobnych sekcjach:

1. Wymagane umiejętności (zarówno twarde jak i miękkie)
2. Technologie i narzędzia (np. języki programowania, oprogramowanie, frameworki, urządzenia, maszyny)
3. Doświadczenie zawodowe (np. lata, typ pracy, branża)
4. Wykształcenie i certyfikaty (jeśli są wymienione)
5. Języki obce
6. Inne wymagania (np. prawo jazdy, gotowość do podróży, dyspozycyjność)

Jeśli oferta dotyczy branży nietechnicznej, dostosuj kategorie tak, aby były odpowiednie dla danej branży.
W przypadku kategorii, dla których nie ma informacji w ofercie, napisz tylko "- Brak informacji".

Zwróć wynik DOKŁADNIE w poniższym formacie (nie dodawaj nic od siebie):

UMIEJĘTNOŚCI:
- ...

TECHNOLOGIE / NARZĘDZIA:
- ...

DOŚWIADCZENIE:
- ...

WYKSZTAŁCENIE / CERTYFIKATY:
- ...

JĘZYKI OBCE:
- ...

INNE WYMAGANIA:
- ...

Treść oferty:
"""
${jobDescription}
"""`;

    // Wygenerowanie odpowiedzi
    console.log("🔄 JobAnalysis: Wysyłanie zapytania do Gemini...");
    const startTime = Date.now();
    
    try {
      const response = await model.generateContent(userPrompt);
      const endTime = Date.now();
      const elapsedTime = (endTime - startTime) / 1000;
      console.log(`✅ JobAnalysis: Otrzymano odpowiedź z Gemini (czas: ${elapsedTime}s)`);
      
      const result = response.response.text();
      if (!result || result.trim().length === 0) {
        console.error("❌ JobAnalysis: Otrzymano pustą odpowiedź od modelu");
        throw new Error("Model zwrócił pustą odpowiedź");
      }
      
      if (!result.includes("UMIEJĘTNOŚCI:") || 
          !result.includes("TECHNOLOGIE / NARZĘDZIA:") || 
          !result.includes("DOŚWIADCZENIE:")) {
        console.error("❌ JobAnalysis: Odpowiedź nie zawiera wymaganych sekcji");
        console.log("📝 JobAnalysis: Fragmenty odpowiedzi:", result.substring(0, 100) + "...");
        throw new Error("Odpowiedź modelu nie zawiera wszystkich wymaganych sekcji");
      }
      
      // Logowanie tokenów - przekazujemy response.response zamiast response
      const tokenStats = logTokenUsage(response.response);
      
      return {
        analysis: result,
        tokenStats
      };
    } catch (modelError) {
      console.error("❌ JobAnalysis: Błąd generowania treści przez model:", modelError);
      
      // Jeśli to błąd wynikający z limitu tokenów lub innego ograniczenia
      const errorMessage = String(modelError); // Konwersja na string niezależnie od typu
      if (errorMessage.toLowerCase().includes("token") || 
          errorMessage.toLowerCase().includes("limit") || 
          errorMessage.toLowerCase().includes("quota")) {
        throw new Error("Przekroczono limit tokenów lub osiągnięto limit zapytań API. Proszę spróbować później.");
      }
      
      throw modelError;
    }
  } catch (error) {
    console.error("❌ JobAnalysis: Błąd analizy:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Nieznany błąd";
    throw new Error(`Nie udało się przeanalizować oferty: ${errorMessage}`);
  }
}

// Funkcja do parsowania odpowiedzi na strukturę danych
export function parseAnalysisResult(analysisText: string) {
  console.log("🔍 JobAnalysis: Parsowanie wyników analizy");
  
  const sections = {
    skills: [] as string[],
    technologies: [] as string[],
    experience: [] as string[],
    education: [] as string[],
    languages: [] as string[],
    other_requirements: [] as string[]
  };

  if (!analysisText || analysisText.trim().length === 0) {
    console.error("❌ JobAnalysis: Pusty tekst do parsowania");
    return sections;
  }

  // Funkcja pomocnicza do wyodrębniania elementów listy
  const extractListItems = (section: string): string[] => {
    if (!section) return [];
    const lines = section.split('\n');
    return lines
      .filter(line => line.trim().startsWith('- '))
      .map(line => line.trim().substring(2));
  };

  // Ekstrakcja sekcji bez użycia flagi /s
  const splitBySection = (text: string): Record<string, string> => {
    const result: Record<string, string> = {};
    
    // Znajdujemy indeksy rozpoczęcia każdej sekcji
    const skillsIndex = text.indexOf('UMIEJĘTNOŚCI:');
    const techIndex = text.indexOf('TECHNOLOGIE / NARZĘDZIA:');
    const expIndex = text.indexOf('DOŚWIADCZENIE:');
    const eduIndex = text.indexOf('WYKSZTAŁCENIE / CERTYFIKATY:');
    const langIndex = text.indexOf('JĘZYKI OBCE:');
    const otherIndex = text.indexOf('INNE WYMAGANIA:');

    console.log(`🔍 JobAnalysis: Znaleziono sekcje w tekście: 
      UMIEJĘTNOŚCI: ${skillsIndex !== -1 ? 'tak' : 'nie'}, 
      TECHNOLOGIE: ${techIndex !== -1 ? 'tak' : 'nie'}, 
      DOŚWIADCZENIE: ${expIndex !== -1 ? 'tak' : 'nie'}, 
      WYKSZTAŁCENIE: ${eduIndex !== -1 ? 'tak' : 'nie'}, 
      JĘZYKI: ${langIndex !== -1 ? 'tak' : 'nie'}, 
      INNE: ${otherIndex !== -1 ? 'tak' : 'nie'}`);
    
    // Wycinamy sekcje na podstawie indeksów
    if (skillsIndex !== -1) {
      const endIndex = techIndex !== -1 ? techIndex : text.length;
      result.skills = text.substring(skillsIndex + 'UMIEJĘTNOŚCI:'.length, endIndex);
    }
    
    if (techIndex !== -1) {
      const endIndex = expIndex !== -1 ? expIndex : text.length;
      result.technologies = text.substring(techIndex + 'TECHNOLOGIE / NARZĘDZIA:'.length, endIndex);
    }
    
    if (expIndex !== -1) {
      const endIndex = eduIndex !== -1 ? eduIndex : text.length;
      result.experience = text.substring(expIndex + 'DOŚWIADCZENIE:'.length, endIndex);
    }
    
    if (eduIndex !== -1) {
      const endIndex = langIndex !== -1 ? langIndex : text.length;
      result.education = text.substring(eduIndex + 'WYKSZTAŁCENIE / CERTYFIKATY:'.length, endIndex);
    }
    
    if (langIndex !== -1) {
      const endIndex = otherIndex !== -1 ? otherIndex : text.length;
      result.languages = text.substring(langIndex + 'JĘZYKI OBCE:'.length, endIndex);
    }
    
    if (otherIndex !== -1) {
      result.other_requirements = text.substring(otherIndex + 'INNE WYMAGANIA:'.length);
    }
    
    return result;
  };

  try {
    // Podziel tekst na sekcje i ekstrahuj elementy listy
    const sectionsText = splitBySection(analysisText);
    
    if (sectionsText.skills) sections.skills = extractListItems(sectionsText.skills);
    if (sectionsText.technologies) sections.technologies = extractListItems(sectionsText.technologies);
    if (sectionsText.experience) sections.experience = extractListItems(sectionsText.experience);
    if (sectionsText.education) sections.education = extractListItems(sectionsText.education);
    if (sectionsText.languages) sections.languages = extractListItems(sectionsText.languages);
    if (sectionsText.other_requirements) sections.other_requirements = extractListItems(sectionsText.other_requirements);

    // Zapewniamy, że każda sekcja ma przynajmniej "brak informacji"
    if (sections.skills.length === 0) sections.skills = ["Brak informacji"];
    if (sections.technologies.length === 0) sections.technologies = ["Brak informacji"];
    if (sections.experience.length === 0) sections.experience = ["Brak informacji"];
    if (sections.education.length === 0) sections.education = ["Brak informacji"];
    if (sections.languages.length === 0) sections.languages = ["Brak informacji"];
    if (sections.other_requirements.length === 0) sections.other_requirements = ["Brak informacji"];

    console.log("✅ JobAnalysis: Zakończono parsowanie wyników");
    console.log(`   - Umiejętności: ${sections.skills.length} elementów`);
    console.log(`   - Technologie: ${sections.technologies.length} elementów`);
    console.log(`   - Doświadczenie: ${sections.experience.length} elementów`);
    console.log(`   - Wykształcenie: ${sections.education.length} elementów`);
    console.log(`   - Języki: ${sections.languages.length} elementów`);
    console.log(`   - Inne: ${sections.other_requirements.length} elementów`);
    
    return sections;
  } catch (error) {
    console.error("❌ JobAnalysis: Błąd podczas parsowania rezultatu analizy:", error);
    // Zwróć domyślne sekcje z informacją o błędzie
    return {
      skills: ["Błąd analizy - spróbuj ponownie"],
      technologies: ["Błąd analizy - spróbuj ponownie"],
      experience: ["Błąd analizy - spróbuj ponownie"],
      education: ["Błąd analizy - spróbuj ponownie"],
      languages: ["Błąd analizy - spróbuj ponownie"],
      other_requirements: ["Błąd analizy - spróbuj ponownie"]
    };
  }
}