import { NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.error('❌ BŁĄD: Brak klucza API Gemini (GEMINI_API_KEY)!');
}
const ai = new GoogleGenAI({ apiKey });
function extractGroundingLinks(htmlContent: string) {
    const linkRegex = /<a[^>]*class="chip"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(htmlContent)) !== null) {
      links.push({ url: match[1], text: match[2].trim() });
    }
    return links;
  }
  
// Funkcja do usuwania odnośników numerycznych
function removeNumericReferences(text: string): string {
  if (!text) return '';
  // Usuwa odnośniki typu [1], [2, 3], [4,5,6] itp.
  return text.replace(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g, '');
}

interface CompanyResponse {
  companyInfo: string;
  employeeReviews: string;
  salaryInfo: string;
  competitorsSimilarities?: string;
}

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Konfiguracja API niekompletna: Brak klucza API Gemini',
    }, { status: 500 });
  }

  try {
    const { companyName, position } = await req.json();
    if (!companyName) {
      return NextResponse.json({ success: false, error: 'Brak nazwy firmy' }, { status: 400 });
    }
    console.log(`🔍 Wyszukiwanie: ${companyName}, stanowisko: ${position}`);

    // 1️⃣ Wymuszenie wyjścia czystego JSON
    const prompt = `Proszę odpowiedzieć na każde pytanie w kilku zdaniach *wyłącznie* w formacie JSON zgodnym ze schematem, nie zwracaj niczego innego:
{
  "companyInfo": "...",
  "employeeReviews": "...",
  "salaryInfo": "...",
  "competitorsSimilarities": "..."
}

WAŻNE: NIE UŻYWAJ numerycznych odniesień do źródeł w nawiasach kwadratowych jak [1], [2,5] itp. Nie dodawaj żadnych numerów w nawiasach kwadratowych w tekście. Przedstaw informacje w formie płynnego, czytelnego tekstu bez tych odnośników.

1. Opisz firmę ${companyName}, profil działalności, główne osiągnięcia oraz ocenę z Google Reviews.
2. Podaj ocenę z Gowork.pl lub Glassdoor.com, wymieniając najczęściej pojawiające się zalety/wady.
3. Zarobki i benefity na stanowisku ${position}.
4. Bliźniacze firmy o podobnym profilu do ${companyName}.`; 
    // prompt design: jasne instrukcje i zero dodatkowego tekstu :contentReference[oaicite:6]{index=6} :contentReference[oaicite:7]{index=7}

    // 2️⃣ Wywołanie modelu z googleSearch jako narzędziem grounding
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: prompt }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    // Grounding z Google Search dostępne od Gemini 2.0 Flash :contentReference[oaicite:8]{index=8} :contentReference[oaicite:9]{index=9}

    const candidates = result.candidates;
    if (!candidates?.length) throw new Error('Brak odpowiedzi od Gemini');

    const first = candidates[0];
    const text = first.content?.parts?.[0]?.text || '';
    const rawHtml = first.groundingMetadata?.searchEntryPoint?.renderedContent || '';
    const groundingLinks = extractGroundingLinks(rawHtml);

    if (!text.trim()) {
      return NextResponse.json({
        success: true,
        message: 'Brak wygenerowanego tekstu, jednak poniżej linki do źródeł.',
        groundingLinks
      });
    }

    // 3️⃣ Parsowanie odpowiedzi JSON
    const jsonMatch = text.match(/\{[\s\S]*"companyInfo"[\s\S]*"employeeReviews"[\s\S]*"salaryInfo"[\s\S]*(?:"competitorsSimilarities"[\s\S]*)*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      // Parsujemy JSON
      const parsed: CompanyResponse = JSON.parse(jsonStr);
      
      // Oczyszczamy teksty z odnośników numerycznych
      const cleanedResponse = {
        companyInfo: removeNumericReferences(parsed.companyInfo),
        employeeReviews: removeNumericReferences(parsed.employeeReviews),
        salaryInfo: removeNumericReferences(parsed.salaryInfo),
        competitorsSimilarities: removeNumericReferences(parsed.competitorsSimilarities ?? 'Brak danych')
      };
      
      return NextResponse.json({
        success: true,
        companyInfo: cleanedResponse.companyInfo,
        employeeReviews: cleanedResponse.employeeReviews,
        salaryInfo: cleanedResponse.salaryInfo,
        competitorsSimilarities: cleanedResponse.competitorsSimilarities,
        fullText: text,
        groundingLinks
      });
    } else {
      // fallback: zwróć cały tekst jako companyInfo, ale po oczyszczeniu
      const cleanedText = removeNumericReferences(text);
      return NextResponse.json({
        success: true,
        companyInfo: cleanedText,
        employeeReviews: 'Brak w formacie JSON',
        salaryInfo: 'Brak w formacie JSON',
        competitorsSimilarities: 'Brak w formacie JSON',
        fullText: text,
        groundingLinks
      });
    }

  } catch (error: any) {
    console.error('❌ Błąd podczas wyszukiwania:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
   