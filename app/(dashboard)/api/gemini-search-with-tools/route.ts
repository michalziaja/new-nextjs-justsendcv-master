import { NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { logTokenUsage } from '@/lib/gemini-client';

// Interfejsy
interface CompanyResponse {
  companyInfo: string;
  employeeReviews: string;
  salaryInfo: string;
  competitorsSimilarities: string;
}

interface AppApiResponse {
  success: boolean;
  companyInfo?: string;
  employeeReviews?: string;
  salaryInfo?: string;
  competitorsSimilarities?: string;
  fullText?: string;
  groundingLinks?: { url: string; text: string }[];
  error?: string;
}

// Inicjalizacja klienta Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai: GoogleGenAI | null = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Funkcja do wyodrębniania linków groundingowych
function extractGroundingLinks(htmlContent: string): { url: string; text: string }[] {
  const linkRegex = /<a[^>]*class="chip"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  const links: { url: string; text: string }[] = [];
  let match;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    links.push({ url: match[1], text: match[2].trim() });
  }
  return links;
}

// Funkcja do usuwania odnośników numerycznych
function removeNumericReferences(text: string): string {
  return text ? text.replace(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g, '') : '';
}

// Funkcja do ekstrakcji oceny z wizytówki Google z groundingLinks (opcjonalny fallback)
function extractRatingFromLinks(links: { url: string; text: string }[]): string | null {
  const ratingRegex = /(\d\.\d\/\d+|\d+\/\d+)/;
  for (const link of links) {
    const match = link.text.match(ratingRegex);
    if (match) return match[0];
  }
  return null;
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!ai || !apiKey) {
    return NextResponse.json(
      { success: false, error: 'Brak klucza API Gemini.' } as AppApiResponse,
      { status: 500 }
    );
  }

  // Parsowanie i walidacja danych wejściowych
  let companyName: string, position: string | undefined;
  try {
    const body = await req.json();
    companyName = body.companyName;
    position = body.position;

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'Brak nazwy firmy.' } as AppApiResponse,
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowy format żądania (błąd JSON).' } as AppApiResponse,
      { status: 400 }
    );
  }

  // Prompt z doprecyzowanymi instrukcjami
  const prompt = `
    Odpowiedz wyłącznie w formacie JSON zgodnym z poniższym schematem, bez dodatkowego tekstu:
    {
      "companyInfo": "...",
      "employeeReviews": "...",
      "salaryInfo": "...",
      "competitorsSimilarities": "..."
    }

    WAŻNE:
    - Każda odpowiedź tekstowa ma mieć 3-5 zdań, być zwięzła i konkretna.
    - Wszystkie pola muszą być stringami, bez zagnieżdżonych obiektów.
    - Nie używaj numerycznych odniesień w nawiasach kwadratowych (np. [1], [2,3]).
    - Używaj danych z Google jako głównego źródła dla oceny i opinii. Wykonaj wyszukiwanie "${companyName}" w pierwszej kolejności.
    - W sekcji employeeReviews formatuj podpunkty za pomocą znaku "- " (np. "- Wysokie zarobki.").

    Pytania:
    1. Opisz firmę ${companyName}: jej profil działalności, główne osiągnięcia, branżę, wielkość i siedzibę. Nie podawaj ocen ani opinii.
    2. Podaj informacje o opiniach o firmie ${companyName} w jednym stringu:
       - Gwiazdki z Google (np. "5.0/5 na podstawie 11 opinii")".
       - Ostatnia opinia z wizytówek Google (krótki cytat w cudzysłowie).
       - 2-3 dobre opinie w podpunktach zaczynających się od "- " (z Gowork.pl, Glassdoor lub Google Reviews).
       - 2-3 złe opinie w podpunktach zaczynających się od "- " (z Gowork.pl, Glassdoor lub Google Reviews).
       - Krótki opis ocen z Gowork.pl lub Glassdoor, w tym liczba opinii i ogólny sentyment (np. "27 opinii, przeważają mieszane.").
    3. Opisz przeciętne zarobki i benefity na stanowisku ${position || 'ogólnym'} w firmie ${companyName}. Podaj konkretne liczby lub przedziały, jeśli dostępne.
    4. Wskaż 2-3 firmy o podobnym profilu do ${companyName} i krótko opisz, co je łączy (np. branża, wielkość, oferta).
  `;

  try {
    // Wywołanie API Gemini z narzędziem googleSearch
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: prompt }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Logowanie informacji o zużyciu tokenów
    console.log('--- Statystyki użycia tokenów dla wyszukiwania informacji o firmie ---');
    logTokenUsage(result);

    const candidates = result.candidates;
    if (!candidates?.length) {
      return NextResponse.json(
        { success: false, error: 'Brak odpowiedzi od Gemini.' } as AppApiResponse,
        { status: 500 }
      );
    }

    const first = candidates[0];
    const text = first.content?.parts?.[0]?.text?.trim() || '';
    const rawHtml = first.groundingMetadata?.searchEntryPoint?.renderedContent || '';
    const groundingLinks = extractGroundingLinks(rawHtml);

    if (!text) {
      return NextResponse.json(
        {
          success: true,
          message: 'Brak wygenerowanego tekstu, dostępne linki do źródeł.',
          groundingLinks,
        } as AppApiResponse,
        { status: 200 }
      );
    }

    // Parsowanie JSON
    const jsonMatch = text.match(/\{[\s\S]*"companyInfo"[\s\S]*"employeeReviews"[\s\S]*"salaryInfo"[\s\S]*"competitorsSimilarities"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed: CompanyResponse = JSON.parse(jsonMatch[0]);

      // Sprawdzenie, czy ocena z wizytówek Google została poprawnie pobrana
      let cleanedEmployeeReviews = removeNumericReferences(parsed.employeeReviews);
      if (cleanedEmployeeReviews.includes("Nie udało się pobrać oceny z wizytówek Google") && groundingLinks.length > 0) {
        const extractedRating = extractRatingFromLinks(groundingLinks);
        if (extractedRating) {
          cleanedEmployeeReviews = cleanedEmployeeReviews.replace(
            "Nie udało się pobrać oceny z wizytówek Google. Sprawdź wizytówkę bezpośrednio w Google.",
            `Ocena z wizytówek Google: ${extractedRating}.`
          );
        }
      }

      // Oczyszczanie odpowiedzi
      const cleanedResponse = {
        companyInfo: removeNumericReferences(parsed.companyInfo),
        employeeReviews: cleanedEmployeeReviews,
        salaryInfo: removeNumericReferences(parsed.salaryInfo),
        competitorsSimilarities: removeNumericReferences(parsed.competitorsSimilarities),
      };

      return NextResponse.json({
        success: true,
        ...cleanedResponse,
        fullText: text,
        groundingLinks,
      } as AppApiResponse);
    } else {
      // Fallback dla niepoprawnego JSON
      const cleanedText = removeNumericReferences(text);
      return NextResponse.json({
        success: true,
        companyInfo: cleanedText,
        employeeReviews: 'Brak danych w formacie JSON.',
        salaryInfo: 'Brak danych w formacie JSON.',
        competitorsSimilarities: 'Brak danych w formacie JSON.',
        fullText: text,
        groundingLinks,
      } as AppApiResponse);
    }
  } catch (error: any) {
    console.error('Błąd podczas wyszukiwania:', error);
    return NextResponse.json(
      { success: false, error: `Błąd serwera: ${error.message || 'Nieznany błąd API'}` } as AppApiResponse,
      { status: 500 }
    );
  }
}