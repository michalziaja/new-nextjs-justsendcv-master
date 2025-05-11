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
  console.log('--- Rozpoczęcie przetwarzania żądania POST ---');
  
  if (!ai) {
    console.error('Błąd: Brak klucza API Gemini.');
    return NextResponse.json(
      { success: false, error: 'Brak klucza API Gemini.', questions: [] } as AppApiResponse,
      { status: 500 }
    );
  }

  // Parsowanie i walidacja danych wejściowych
  let company: string, title: string, full_description: string | undefined;
  try {
    const body = await req.json();
    company = body.company;
    title = body.title;
    full_description = body.full_description;

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

  // Instrukcja systemowa
  const systemInstruction = `
    Jesteś ekspertem HR specjalizującym się w rekrutacji. Tworzysz profesjonalne pytania rekrutacyjne, które są precyzyjne, zgodne z najlepszymi praktykami i dostosowane do stanowiska oraz firmy. 
    Zawsze zwracaj odpowiedź w formacie JSON zgodnym z podanym schematem.
  `;

  // Prompt użytkownika
  const userPrompt = `
    Wygeneruj 15 profesjonalnych pytań rekrutacyjnych dla stanowiska ${title} w firmie ${company}.
    Pytania powinny obejmować:
    - Doświadczenie zawodowe (4 pytania)
    - Umiejętności techniczne i kompetencje (3 pytania)
    - Pytania behawioralne i sytuacyjne (3 pytania)
    - Motywację i dopasowanie do firmy ${company} (3 pytania)
    - Oczekiwania i plany zawodowe (2 pytania)

    Opis stanowiska: ${full_description}

    Dla każdego pytania dodaj 4 krótkie wskazówki, jak najlepiej odpowiedzieć.
    Odpowiedz w formacie JSON:
    {
      "questions": [
        { "id": 1, "question": "Treść pytania", "tips": ["Wskazówka 1", "Wskazówka 2", "Wskazówka 3", "Wskazówka 4"] }
      ]
    }
  `;

  // Połączenie instrukcji systemowej i promptu użytkownika w jedną treść
  const combinedPrompt = `${systemInstruction}\n\n${userPrompt}`;
  console.log('--- Prompt przygotowany, rozpoczynam wywołanie API Gemini ---');
  
  try {
    console.log('--- Rozpoczęcie komunikacji z API Gemini ---');
    // Wywołanie API Gemini z timeoutem
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('--- Timeout podczas wywołania API Gemini (30s) ---');
    }, 30000); // 30 sekund timeoutu
    
    console.log('--- Konfiguracja podstawowych parametrów modelu ---');
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: combinedPrompt }], // Przekazujemy jedną treść bez pola `role`
    }).catch(error => {
      console.error('--- Błąd podczas wywołania API Gemini ---', error);
      throw error;
    }).finally(() => {
      clearTimeout(timeoutId);
      console.log('--- Zakończono wywołanie API (timeout cleared) ---');
    });
    
    // Sprawdzenie czy zapytanie zostało przerwane
    if (controller.signal.aborted) {
      console.error('--- Zapytanie do API Gemini zostało przerwane z powodu timeoutu ---');
      throw new Error('Timeout podczas komunikacji z API Gemini');
    }
    
    console.log('--- Odpowiedź z API Gemini otrzymana pomyślnie ---');

    // Logowanie informacji o zużyciu tokenów
    console.log('--- Statystyki użycia tokenów dla generowanych pytań ---');
    try {
      const tokenStats = logTokenUsage(result);
      console.log('Statystyki tokenów:', JSON.stringify(tokenStats));
    } catch (tokenError) {
      console.error('--- Błąd podczas logowania tokenów ---', tokenError);
    }
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log('--- Otrzymany tekst (pierwsze 100 znaków): ---', text?.substring(0, 100));
    
    if (!text) {
      console.error('--- Brak tekstu w odpowiedzi API ---');
      return NextResponse.json(
        { success: false, error: 'API Gemini zwróciło pustą odpowiedź.', questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }

    // Parsowanie JSON z odpowiedzi
    console.log('--- Rozpoczynam parsowanie JSON ---');
    const jsonMatch = text.match(/\{[\S\s]*"questions"[\S\s]*\}/);
    if (!jsonMatch) {
      console.error('--- Brak poprawnej struktury JSON w odpowiedzi ---');
      console.log('Otrzymana odpowiedź:', text);
      return NextResponse.json(
        { success: false, error: 'Brak poprawnej struktury JSON w odpowiedzi.', questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }

    try {
      const parsedData: GeminiApiResponse = JSON.parse(jsonMatch[0]);
      console.log(`--- JSON sparsowany pomyślnie, znaleziono ${parsedData.questions?.length || 0} pytań ---`);
      
      if (!Array.isArray(parsedData.questions)) {
        console.error('--- Brak tablicy "questions" w odpowiedzi ---');
        return NextResponse.json(
          { success: false, error: 'Nieprawidłowa struktura danych (brak tablicy "questions").', questions: [] } as AppApiResponse,
          { status: 500 }
        );
      }

      console.log('--- Zwracam odpowiedź z pytaniami ---');
      return NextResponse.json({ success: true, questions: parsedData.questions } as AppApiResponse);
    } catch (parseError: any) {
      console.error('--- Błąd podczas parsowania JSON ---', parseError);
      console.log('Dopasowany tekst JSON:', jsonMatch[0].substring(0, 200) + '...');
      return NextResponse.json(
        { success: false, error: `Błąd parsowania JSON: ${parseError.message}`, questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('--- Błąd podczas przetwarzania żądania ---', error);
    return NextResponse.json(
      { success: false, error: `Błąd serwera: ${error.message || 'Nieznany błąd API'}`, questions: [] } as AppApiResponse,
      { status: 500 }
    );
  }
}

// Zwiększenie limitu czasu dla funkcji serverless
export const config = {
  maxDuration: 60 // 60 sekund dla Vercel
};
