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
  part?: number;
  total_parts?: number;
  error?: string;
}

// Mapowanie kategorii pytań do części
const questionCategories = {
  // Część 1 (5 pytań)
  1: [
    { name: 'Doświadczenie zawodowe', count: 3 },
    { name: 'Umiejętności techniczne', count: 2 }
  ],
  // Część 2 (5 pytań)
  2: [
    { name: 'Umiejętności techniczne', count: 1 },
    { name: 'Behawioralne i sytuacyjne', count: 3 },
    { name: 'Motywacja i dopasowanie', count: 1 }
  ],
  // Część 3 (5 pytań)
  3: [
    { name: 'Motywacja i dopasowanie', count: 2 },
    { name: 'Oczekiwania i plany zawodowe', count: 2 },
    { name: 'Sprawdzenie zgodności z profilem firmy', count: 1 }
  ]
};

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
  let company: string, title: string, full_description: string | undefined, part: number = 1;
  try {
    const body = await req.json();
    company = body.company;
    title = body.title;
    full_description = body.full_description;
    
    // Pobieranie numeru części (domyślnie 1)
    if (body.part && [1, 2, 3].includes(Number(body.part))) {
      part = Number(body.part);
    }
    console.log(`--- Generowanie pytań dla części ${part} z 3 ---`);

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

  // Pobranie kategorii dla wybranej części
  const categories = questionCategories[part as keyof typeof questionCategories];
  if (!categories) {
    return NextResponse.json(
      { success: false, error: `Nieprawidłowy numer części: ${part}`, questions: [] } as AppApiResponse,
      { status: 400 }
    );
  }

  // Instrukcja systemowa
  const systemInstruction = `
    Jesteś ekspertem HR specjalizującym się w rekrutacji. Tworzysz profesjonalne pytania rekrutacyjne, które są precyzyjne, zgodne z najlepszymi praktykami i dostosowane do stanowiska oraz firmy. 
    Zawsze zwracaj odpowiedź w formacie JSON zgodnym z podanym schematem.
  `;

  // Tworzenie części promptu dotyczącej kategorii
  const categoriesPrompt = categories.map(cat => `- ${cat.name} (${cat.count} ${cat.count === 1 ? 'pytanie' : 'pytania'})`).join('\n');
  
  // ID początkowe dla pytań w danej części
  const startQuestionId = (part - 1) * 5 + 1;

  // Prompt użytkownika dla konkretnej części
  const userPrompt = `
    Wygeneruj dokładnie 5 profesjonalnych pytań rekrutacyjnych dla stanowiska ${title} w firmie ${company}.
    
    To część ${part} z 3 części pytań. Pytania z tej części powinny obejmować kategorie:
    ${categoriesPrompt}

    Opis stanowiska: ${full_description ? full_description.substring(0, 200) + '...' : 'Brak szczegółowego opisu'}

    Dla każdego pytania dodaj 3 krótkie wskazówki, jak najlepiej odpowiedzieć.
    Numeracja pytań powinna zaczynać się od ${startQuestionId}.
    
    Odpowiedz tylko w formacie JSON:
    {
      "questions": [
        { "id": ${startQuestionId}, "question": "Treść pytania", "tips": ["Wskazówka 1", "Wskazówka 2", "Wskazówka 3"] }
      ]
    }
  `;

  // Połączenie instrukcji systemowej i promptu użytkownika w jedną treść
  const combinedPrompt = `${systemInstruction}\n\n${userPrompt}`;
  console.log('--- Prompt przygotowany, rozpoczynam wywołanie API Gemini ---');
  
  try {
    console.log('--- Rozpoczęcie komunikacji z API Gemini ---');
    console.log('--- Konfiguracja podstawowych parametrów modelu ---');
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Używamy szybszego modelu dla lepszej wydajności
      contents: [{ text: combinedPrompt }], // Przekazujemy jedną treść bez pola `role`
    }).catch(error => {
      console.error('--- Błąd podczas wywołania API Gemini ---', error);
      throw error;
    });
    
    console.log('--- Odpowiedź z API Gemini otrzymana pomyślnie ---');

    // Logowanie informacji o zużyciu tokenów
    console.log(`--- Statystyki użycia tokenów dla części ${part} ---`);
    try {
      const tokenStats = logTokenUsage(result);
      console.log('Statystyki tokenów:', JSON.stringify(tokenStats));
    } catch (tokenError) {
      console.error('--- Błąd podczas logowania tokenów ---', tokenError);
    }
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log('--- Otrzymany tekst ---');
    
    if (!text) {
      console.error('--- Brak tekstu w odpowiedzi API ---');
      return NextResponse.json(
        { success: false, error: 'API Gemini zwróciło pustą odpowiedź.', questions: [], part, total_parts: 3 } as AppApiResponse,
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
        { success: false, error: 'Brak poprawnej struktury JSON w odpowiedzi.', questions: [], part, total_parts: 3 } as AppApiResponse,
        { status: 500 }
      );
    }

    try {
      const parsedData: GeminiApiResponse = JSON.parse(jsonMatch[0]);
      console.log(`--- JSON sparsowany pomyślnie, znaleziono ${parsedData.questions?.length || 0} pytań ---`);
      
      if (!Array.isArray(parsedData.questions)) {
        console.error('--- Brak tablicy "questions" w odpowiedzi ---');
        return NextResponse.json(
          { success: false, error: 'Nieprawidłowa struktura danych (brak tablicy "questions").', questions: [], part, total_parts: 3 } as AppApiResponse,
          { status: 500 }
        );
      }

      console.log(`--- Zwracam odpowiedź z pytaniami (część ${part}) ---`);
      return NextResponse.json({ 
        success: true, 
        questions: parsedData.questions,
        part,
        total_parts: 3
      } as AppApiResponse);
    } catch (parseError: any) {
      console.error('--- Błąd podczas parsowania JSON ---', parseError);
      console.log('Dopasowany tekst JSON:', jsonMatch[0].substring(0, 200) + '...');
      return NextResponse.json(
        { success: false, error: `Błąd parsowania JSON: ${parseError.message}`, questions: [], part, total_parts: 3 } as AppApiResponse,
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('--- Błąd podczas przetwarzania żądania ---', error);
    return NextResponse.json(
      { success: false, error: `Błąd serwera: ${error.message || 'Nieznany błąd API'}`, questions: [], part, total_parts: 3 } as AppApiResponse,
      { status: 500 }
    );
  }
}

