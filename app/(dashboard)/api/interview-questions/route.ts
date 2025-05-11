import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { logTokenUsage } from '@/lib/gemini-client';

// Interfejsy
interface Question {
  id: number;
  question: string;
  tips: string[];
}

interface GeminiApiResponse {
  questions: Question[];
}

interface AppApiResponse {
  success: boolean;
  questions: Question[];
  error?: string;
}

// Inicjalizacja klienta Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai: GoogleGenAI | null = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: Request): Promise<NextResponse> {
  if (!ai) {
    return NextResponse.json(
      { success: false, error: 'Brak klucza API Gemini.', questions: [] } as AppApiResponse,
      { status: 500 }
    );
  }

  // Parsowanie i walidacja danych wejściowych
  let company: string, title: string, full_description: string | undefined, group: number;
  try {
    const body = await req.json();
    company = body.company;
    title = body.title;
    full_description = body.full_description;
    group = parseInt(body.group) || 1; // domyślnie grupa 1 (1-5 pytań)
    
    if (isNaN(group) || group < 1 || group > 3) {
      group = 1; // zabezpieczenie przed nieprawidłowymi wartościami
    }

    if (!company || !title) {
      return NextResponse.json(
        { success: false, error: 'Brak wymaganych pól: "company" lub "title".', questions: [] } as AppApiResponse,
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowy format żądania (błąd JSON).', questions: [] } as AppApiResponse,
      { status: 400 }
    );
  }

  // Określenie kategorii pytań dla danej grupy
  let categories: { [key: string]: number } = {};
  
  if (group === 1) {
    categories = {
      "Doświadczenie zawodowe": 2,
      "Umiejętności techniczne i kompetencje": 1,
      "Pytania behawioralne i sytuacyjne": 1,
      "Motywację i dopasowanie do firmy": 1
    };
  } else if (group === 2) {
    categories = {
      "Doświadczenie zawodowe": 1,
      "Umiejętności techniczne i kompetencje": 2,
      "Pytania behawioralne i sytuacyjne": 1,
      "Motywację i dopasowanie do firmy": 1
    };
  } else if (group === 3) {
    categories = {
      "Doświadczenie zawodowe": 1,
      "Umiejętności techniczne i kompetencje": 0,
      "Pytania behawioralne i sytuacyjne": 1,
      "Motywację i dopasowanie do firmy": 1,
      "Oczekiwania i plany zawodowe": 2
    };
  }

  // Przygotowanie podsumowania kategorii dla promptu
  const categoriesText = Object.entries(categories)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => `- ${category} (${count} ${count === 1 ? 'pytanie' : 'pytania'})`)
    .join('\n');

  // Instrukcja systemowa
  const systemInstruction = `
    Jesteś ekspertem HR specjalizującym się w rekrutacji. Tworzysz profesjonalne pytania rekrutacyjne, które są precyzyjne, zgodne z najlepszymi praktykami i dostosowane do stanowiska oraz firmy. 
    Zawsze zwracaj odpowiedź w formacie JSON zgodnym z podanym schematem.
  `;

  // Prompt użytkownika
  const userPrompt = `
    Wygeneruj 5 profesjonalnych pytań rekrutacyjnych dla stanowiska ${title} w firmie ${company}.
    To część ${group} z 3 zadań generowania pytań. 
    Pytania powinny obejmować następujące kategorie:
    ${categoriesText}

    Opis stanowiska: ${full_description}

    Dla każdego pytania dodaj 4 krótkie wskazówki, jak najlepiej odpowiedzieć.
    WAŻNE: Numeruj pytania od ${(group - 1) * 5 + 1} do ${group * 5}.
    Odpowiedz w formacie JSON:
    {
      "questions": [
        { "id": ${(group - 1) * 5 + 1}, "question": "Treść pytania", "tips": ["Wskazówka 1", "Wskazówka 2", "Wskazówka 3", "Wskazówka 4"] }
      ]
    }
  `;

  // Połączenie instrukcji systemowej i promptu użytkownika w jedną treść
  const combinedPrompt = `${systemInstruction}\n\n${userPrompt}`;
  console.log(`Generowanie pytań grupa ${group}/3 dla ${company} - ${title}`);
  
  try {
    // Wywołanie API Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: combinedPrompt }], // Przekazujemy jedną treść bez pola `role`
    });

    // Logowanie informacji o zużyciu tokenów
    console.log(`--- Statystyki użycia tokenów dla generowanych pytań (grupa ${group}/3) ---`);
    logTokenUsage(result);
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      return NextResponse.json(
        { success: false, error: 'API Gemini zwróciło pustą odpowiedź.', questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }

    // Parsowanie JSON z odpowiedzi
    const jsonMatch = text.match(/\{[\S\s]*"questions"[\S\s]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, error: 'Brak poprawnej struktury JSON w odpowiedzi.', questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }

    const parsedData: GeminiApiResponse = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsedData.questions)) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowa struktura danych (brak tablicy "questions").', questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      questions: parsedData.questions,
      group: group,
      totalGroups: 3
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Błąd serwera: ${error.message || 'Nieznany błąd API'}`, questions: [] } as AppApiResponse,
      { status: 500 }
    );
  }
}
