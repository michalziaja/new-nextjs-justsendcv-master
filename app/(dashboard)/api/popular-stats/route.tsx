import { NextRequest, NextResponse } from 'next/server';
import { createModel, logTokenUsage } from '@/lib/gemini-client'; // Klient Gemini

// Definicje typów (takie same jak w StatsContext)
interface SkillItem {
  name: string;
  count: number;
  color: string;
  gradientColor: string;
}

interface JobPosition {
  title: string;
  count: number;
  color: string;
}

// Kolory (przeniesione z StatsContext dla spójności API)
const colorsForSkills = [
  { start: "#3b82f6", end: "#60a5fa" }, // niebieski
  { start: "#8b5cf6", end: "#a78bfa" }, // fioletowy
  { start: "#ec4899", end: "#f472b6" }, // różowy
  { start: "#f59e0b", end: "#fbbf24" }, // pomarańczowy
  { start: "#10b981", end: "#34d399" }, // zielony
  { start: "#06b6d4", end: "#22d3ee" }, // turkusowy
  { start: "#6366f1", end: "#818cf8" }, // indygo
  { start: "#ef4444", end: "#f87171" }  // czerwony
];

const positionColors = [
  "#3b82f6", // niebieski
  "#8b5cf6", // fioletowy
  "#ec4899", // różowy
  "#f59e0b", // pomarańczowy
  "#10b981", // zielony
  "#06b6d4", // turkusowy
  "#6366f1", // indygo
  "#ef4444"  // czerwony
];

const getColorPair = (index: number) => colorsForSkills[index % colorsForSkills.length];
const getPositionColor = (index: number) => positionColors[index % positionColors.length];

export async function POST(req: NextRequest) {
  console.log("🚀 API popular-stats (POST): Rozpoczęcie żądania");
  const startTime = Date.now();
  try {
    // Odczyt danych z ciała żądania POST
    const { 
      allSkillsList = [], 
      allTechnologiesList = [], 
      allTitles = [] 
    } = await req.json() as { 
      allSkillsList?: string[]; 
      allTechnologiesList?: string[]; 
      allTitles?: string[]; 
    };

    console.log("📊 API popular-stats (POST): Otrzymane dane:");
    console.log("  Skills List Length:", allSkillsList.length, "| Sample:", allSkillsList.slice(0,3).join(', '));
    console.log("  Technologies List Length:", allTechnologiesList.length, "| Sample:", allTechnologiesList.slice(0,3).join(', '));
    console.log("  Titles List Length:", allTitles.length, "| Sample:", allTitles.slice(0,3).join(', '));

    let skills: SkillItem[] = [];
    let technologies: SkillItem[] = [];

    // --- 1. ANALIZA UMIEJĘTNOŚCI I TECHNOLOGII (na podstawie danych z requestu) ---
    if (allSkillsList.length > 0 || allTechnologiesList.length > 0) {
      const model = createModel("gemini-1.5-flash-8b", // Używamy gemini-1.5-flash
        `Jesteś ekspertem ds. analizy danych z rynku pracy. Twoim zadaniem jest analiza list umiejętności i technologii.
        Zwróć listę maksymalnie 10 najpopularniejszych unikalnych umiejętności oraz maksymalnie 10 najpopularniejszych unikalnych technologii.
        Dla każdej pozycji podaj nazwę ('name') i liczbę wystąpień ('count').
        Wynik zwróć w formacie JSON jako obiekt z dwoma kluczami: 'skills' i 'technologies'.
        Przykład: { "skills": [{ "name": "JavaScript", "count": 5 }, ...], "technologies": [{ "name": "React", "count": 8 }, ...] }.
        Jeśli lista wejściowa jest pusta dla danej kategorii, zwróć pustą listę w JSON dla tej kategorii.`
      );

      const promptParts = [];
      if (allSkillsList.length > 0) {
        promptParts.push(`Przeanalizuj następującą listę umiejętności: ${allSkillsList.join(', ')}.`);
      }
      if (allTechnologiesList.length > 0) {
        promptParts.push(`Przeanalizuj następującą listę technologii: ${allTechnologiesList.join(', ')}.`);
      }
      const prompt = promptParts.join('\\n');

      if (prompt) {
        console.log("🤖 API popular-stats: Wywoływanie Gemini dla skills/tech...");
        try {
          const generationResult = await model.generateContent(prompt);
          const geminiResponse = (generationResult as any).response || generationResult;
          const candidates = geminiResponse.candidates;

          if (!candidates || candidates.length === 0 || !candidates[0].content || !candidates[0].content.parts || candidates[0].content.parts.length === 0) {
            console.error("Błąd API (Gemini - skills/tech): Nieoczekiwana struktura odpowiedzi", candidates);
            throw new Error("Nie udało się uzyskać treści z modelu Gemini dla skills/tech.");
          }
          let text = candidates[0].content.parts[0].text.trim();
          logTokenUsage(geminiResponse);
          //console.log("📝 API popular-stats (skills/tech) - Surowa odpowiedź Gemini:", text);

          // Czyszczenie odpowiedzi z bloków kodu markdown
          if (text.startsWith("```json")) {
            text = text.substring(7);
          }
          if (text.endsWith("```")) {
            text = text.substring(0, text.length - 3);
          }
          text = text.trim(); // Dodatkowe przycięcie po usunięciu znaczników
          //console.log("🧹 API popular-stats (skills/tech) - Odpowiedź Gemini po czyszczeniu:", text);

          const parsedResult = JSON.parse(text);

          skills = (parsedResult.skills || []).map((item: any, index: number) => {
            const colorPair = getColorPair(index);
            return {
              name: item.name,
              count: item.count,
              color: colorPair.start,
              gradientColor: colorPair.end,
            };
          }).sort((a: SkillItem, b: SkillItem) => b.count - a.count).slice(0, 10);

          technologies = (parsedResult.technologies || []).map((item: any, index: number) => {
            const colorPair = getColorPair(index + skills.length);
            return {
              name: item.name,
              count: item.count,
              color: colorPair.start,
              gradientColor: colorPair.end,
            };
          }).sort((a: SkillItem, b: SkillItem) => b.count - a.count).slice(0, 10);

          //console.log(`💡 API popular-stats: Przetworzono ${skills.length} umiejętności i ${technologies.length} technologii.`);
        } catch (e) {
          console.error("Błąd API (Gemini - skills/tech):", e);
          // Zerowanie w przypadku błędu, aby nie wysłać starych/częściowych danych
          skills = [];
          technologies = [];
        }
      }
    }

    // --- 2. ANALIZA STANOWISK (na podstawie danych z requestu) ---
    let positions: JobPosition[] = [];

    if (allTitles.length > 0) {
        const model = createModel("gemini-1.5-flash",
            `Jesteś ekspertem ds. rekrutacji i analizy rynku pracy.
          
          Twoim zadaniem jest przeanalizować listę tytułów stanowisk i wyciągnąć 5 które powtarzają się najczęściej.
          
          Uwzględnij:
          - Stanowiska pokrewne np. Przedstawciel handlowy-Handlowiec,
          - uwzględnij poziom stanowiska (Junior, Senior),
          - język (polski/angielski),
          - najlepiej jak zgadzaja się minimum 2 słowa z tytułu,
                    
          Wynik:
          Zwróć tablicę obiektów JSON, gdzie:
          - title to nazwa zagregowanej kategorii zawodowej (np. "Przedstawciel handlowy", "Menager", "Kierownik"),
          - count to liczba stanowisk pasujących do tej kategorii (minimum 2).
          
          Zignoruj unikalne stanowiska, które nie pasują do żadnej grupy.
          Zwróć pustą tablicę, jeśli nic nie można zagregować.
          
          Przykład wyjścia:
          [
            { "title": "Przedstawciel handlowy", "count": 9 },
            { "title": "Menager", "count": 2 },
            ...
          ]`
          );

      const prompt = `Przeanalizuj następującą listę tytułów stanowisk i zwróć zagregowane kategorie: ${allTitles.join(', ')}.`;
      
      console.log("🤖 API popular-stats: Wywoływanie Gemini dla positions...");
      try {
        const generationResult = await model.generateContent(prompt);
        const geminiResponse = (generationResult as any).response || generationResult;
        const candidates = geminiResponse.candidates;

        if (!candidates || candidates.length === 0 || !candidates[0].content || !candidates[0].content.parts || candidates[0].content.parts.length === 0) {
          console.error("Błąd API (Gemini - positions): Nieoczekiwana struktura odpowiedzi", candidates);
          throw new Error("Nie udało się uzyskać treści z modelu Gemini dla positions.");
        }
        let text = candidates[0].content.parts[0].text.trim();
        logTokenUsage(geminiResponse);
        //console.log("📝 API popular-stats (positions) - Surowa odpowiedź Gemini:", text);

        // Czyszczenie odpowiedzi z bloków kodu markdown
        if (text.startsWith("```json")) {
          text = text.substring(7);
        }
        if (text.endsWith("```")) {
          text = text.substring(0, text.length - 3);
        }
        text = text.trim(); // Dodatkowe przycięcie po usunięciu znaczników
        
        // Dodatkowe czyszczenie odpowiedzi z niestandardowych znaków
        text = text.replace(/[\u{0000}-\u{0008}\u{000B}-\u{000C}\u{000E}-\u{001F}\u{007F}-\u{009F}]/gu, ""); // Usuwanie znaków kontrolnych
        
        // Rozszerzona obsługa znaków specjalnych i formatowania
        text = text.replace(/^[^[{]/, ""); // Usuń wszystkie znaki przed początkiem JSON ([ lub {)
        
        // Próba naprawy najpopularniejszych problemów z JSON
        if (!text.startsWith('[') && !text.startsWith('{')) {
          // Jeśli tekst nie zaczyna się od [ lub {, próbujemy znaleźć początek JSON
          const jsonStart = text.indexOf('[') >= 0 ? text.indexOf('[') : text.indexOf('{');
          if (jsonStart >= 0) {
            text = text.substring(jsonStart);
          }
        }
        
        console.log("🧹 API popular-stats (positions) - Odpowiedź Gemini po czyszczeniu:", text);

        try {
          const parsedResult = JSON.parse(text);
          
          if (Array.isArray(parsedResult)) {
            positions = parsedResult.map((item: any, index: number) => ({
              title: item.title,
              count: item.count,
              color: getPositionColor(index),
            })).sort((a: JobPosition, b: JobPosition) => b.count - a.count).slice(0, 10);
            console.log(`💡 API popular-stats: Przetworzono ${positions.length} stanowisk.`);
          } else {
            console.error("Odpowiedź Gemini (positions) nie jest tablicą:", parsedResult);
            positions = []; // Zerowanie w przypadku złego formatu
          }
        } catch (e) {
          console.error("Błąd API (Gemini - positions):", e);
          positions = []; // Zerowanie w przypadku błędu
        }
      } catch (e) {
        console.error("Błąd API (Gemini - positions):", e);
        positions = []; // Zerowanie w przypadku błędu
      }
    }

    const endTime = Date.now();
    console.log(`✅ API popular-stats: Zakończono przetwarzanie w ${(endTime - startTime) / 1000}s. Zwracanie danych.`);
    return NextResponse.json({
      skills,
      technologies,
      positions,
    });

  } catch (error) {
    console.error("General API error (popular-stats):", error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
