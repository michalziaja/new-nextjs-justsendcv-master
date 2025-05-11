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
  console.log(combinedPrompt);
  try {
    // Wywołanie API Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: combinedPrompt }], // Przekazujemy jedną treść bez pola `role`
    });

    // Logowanie informacji o zużyciu tokenów
    console.log('--- Statystyki użycia tokenów dla generowanych pytań ---');
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

    return NextResponse.json({ success: true, questions: parsedData.questions } as AppApiResponse);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Błąd serwera: ${error.message || 'Nieznany błąd API'}`, questions: [] } as AppApiResponse,
      { status: 500 }
    );
  }
}
