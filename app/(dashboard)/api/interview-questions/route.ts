
import { NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.error('❌ BŁĄD: Brak klucza API Gemini (GEMINI_API_KEY)!');
}
const ai = new GoogleGenAI({ apiKey });

// Dodajemy Cache dla ostatnich zapytań, aby uniknąć podwójnego wywoływania API
const requestCache = new Map<string, Promise<NextResponse>>();
// Czas wygaśnięcia cache w milisekundach (5 sekund)
const CACHE_EXPIRY = 5000;

// Interfejs dla pytania
interface Question {
  id: number;
  question: string;
  tips: string[];
}

// Interfejs dla odpowiedzi JSON z API
interface QuestionsResponse {
  questions: Question[];
}

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Konfiguracja API niekompletna: Brak klucza API Gemini',
    }, { status: 500 });
  }

  try {
    const { companyName, position, description } = await req.json();
    if (!companyName || !position) {
      return NextResponse.json({ success: false, error: 'Brak nazwy firmy lub stanowiska' }, { status: 400 });
    }

    // Tworzymy klucz cache na podstawie parametrów zapytania
    const cacheKey = `${companyName}-${position}-${description || ''}`;
    
    // Sprawdzamy, czy takie zapytanie jest już w cache
    if (requestCache.has(cacheKey)) {
      console.log(`📋 Używam zcachowanej odpowiedzi dla: ${position} w ${companyName}`);
      return await requestCache.get(cacheKey)!;
    }

    console.log(`🔍 Generowanie pytań rekrutacyjnych dla: ${position} w ${companyName}`);

    // Funkcja do faktycznego przetworzenia zapytania
    const processRequest = async () => {
      const prompt = `Wygeneruj 15 profesjonalnych pytań rekrutacyjnych, które mogą pojawić się podczas rozmowy o pracę na stanowisko ${position} w firmie ${companyName}.
      
      Pytania powinny należeć do następujących kategorii:
      1. Pytania o doświadczenie zawodowe kandydata (4 pytania)
      2. Pytania o umiejętności techniczne i kompetencje związane ze stanowiskiem (3 pytania)
      3. Pytania behawioralne i sytuacyjne (3 pytania)
      4. Pytania o motywację i dopasowanie do firmy ${companyName} (3 pytania)
      5. Pytania o oczekiwania i plany zawodowe (2 pytania)
      
      Opis stanowiska (jeśli dostępny): ${description || 'Brak szczegółowego opisu'}
      
      Dla każdego pytania dodaj 4 krótkie wskazówki, jak najlepiej na nie odpowiedzieć.
      
      Odpowiedz w formacie JSON w języku polskim zgodnym z poniższym schematem:
      {
        "questions": [
          {
            "id": 1,
            "question": "Treść pytania 1",
            "tips": ["Wskazówka 1", "Wskazówka 2", "Wskazówka 3", "Wskazówka 4"]
          },
          {
            "id": 2,
            "question": "Treść pytania 2",
            "tips": ["Wskazówka 1", "Wskazówka 2", "Wskazówka 3", "Wskazówka 4"]
          }
        ]
      }`;

      const result: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ text: prompt }],
      });

      const candidates = result.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('Brak kandydatów w odpowiedzi Gemini');
      }

      const first = candidates[0];
      const text = first.content?.parts?.[0]?.text || '';

      if (!text.trim()) {
        console.warn("Gemini nie wygenerowało tekstu.");
        return NextResponse.json({
          success: false,
          message: 'Gemini nie wygenerowało pytań.'
        });
      }

      console.log("Wygenerowany tekst z pytaniami rekrutacyjnymi");
      
      // Próba parsowania JSON z odpowiedzi tekstowej
      try {
        // Szukanie obiektu JSON w tekście (może być poprzedzony lub zakończony dodatkowym tekstem)
        const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsedData: QuestionsResponse = JSON.parse(jsonStr);
          
          console.log("Zparsowana odpowiedź JSON z pytaniami rekrutacyjnymi");
          
          return NextResponse.json({
            success: true,
            questions: parsedData.questions,
            fullText: text
          });
        } else {
          console.warn("Nie znaleziono obiektu JSON w odpowiedzi");
          
          // Jeśli nie udało się znaleźć JSON, zwracamy błąd
          return NextResponse.json({
            success: false,
            error: "Nie udało się wygenerować pytań w odpowiednim formacie",
            fullText: text
          }, { status: 500 });
        }
      } catch (parseError) {
        console.error("Błąd parsowania JSON:", parseError);
        
        // W przypadku błędu parsowania, zwracamy błąd
        return NextResponse.json({
          success: false,
          error: "Błąd parsowania wygenerowanych pytań",
          fullText: text
        }, { status: 500 });
      }
    };

    // Zapisujemy Promise do cache
    const responsePromise = processRequest();
    requestCache.set(cacheKey, responsePromise);
    
    // Ustawiamy timer do usunięcia z cache po określonym czasie
    setTimeout(() => {
      requestCache.delete(cacheKey);
    }, CACHE_EXPIRY);
    
    return await responsePromise;
    
  } catch (error: any) {
    console.error('❌ Błąd podczas generowania pytań:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}