import { NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
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
  group?: number;
  totalGroups?: number;
  inputTokens?: number;
  outputTokens?: number;
}

// Inicjalizacja klienta Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai: GoogleGenAI | null = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Zaktualizowana funkcja pomocnicza do ekstrakcji tokenów
const getUsageMetadata = (result: GenerateContentResponse) => {
  // Najpierw spróbuj uzyskać usageMetadata z result.response (nowsze API Gemini)
  // Gemini API może zagnieżdżać odpowiedź w polu 'response'
  const mainResponse: any = (result as any).response || result;
  const usageMetadata = mainResponse.usageMetadata;

  return {
    // Użyj pól specyficznych dla Gemini lub ogólnych, jeśli te pierwsze nie istnieją
    inputTokens: usageMetadata?.totalInputTokens || usageMetadata?.promptTokenCount || 0,
    outputTokens: usageMetadata?.totalOutputTokens || usageMetadata?.candidatesTokenCount || 0,
  };
};

export async function POST(req: Request): Promise<NextResponse> {
  if (!ai) {
    return NextResponse.json(
      { success: false, error: 'Brak klucza API Gemini.', questions: [] } as AppApiResponse,
      { status: 500 }
    );
  }

  // Parsowanie i walidacja danych wejściowych
  let company: string, title: string, full_description: string | undefined, group: number, cv_data: any;
  try {
    const body = await req.json();
    company = body.company;
    title = body.title;
    full_description = body.full_description;
    group = parseInt(body.group); 
    cv_data = body.cv_data || null;

    if (isNaN(group) || group < 1) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowy numer grupy.', questions: [] } as AppApiResponse,
        { status: 400 }
      );
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

  const cvAvailable = !!cv_data;
  const totalParts = cvAvailable ? 4 : 3;

  if (group > totalParts) {
    return NextResponse.json(
      { success: false, error: `Nieprawidłowy numer grupy. Maksymalna grupa to ${totalParts}.`, questions: [] } as AppApiResponse,
      { status: 400 }
    );
  }
  
  let categories: { [key: string]: number } = {};

  if (cvAvailable) {
    // Kategorie dla 4 grup, gdy CV jest dostępne
    if (group === 1) {
      categories = {
        "Ogólne pytania o doświadczenie i motywację w kontekście CV i oferty": 2,
        "Kluczowe umiejętności z CV versus wymagania stanowiska": 2,
        "Pierwsze wrażenie i zrozumienie roli": 1
      };
    } else if (group === 2) {
      categories = {
        "Szczegółowe omówienie konkretnych projektów/zadań z CV kandydata": 3,
        "Sposób wykorzystania umiejętności technicznych/specjalistycznych (z CV) w praktyce": 2
      };
    } else if (group === 3) {
      categories = {
        "Pytania behawioralne oparte na sytuacjach z doświadczenia zawodowego (z CV)": 3,
        "Radzenie sobie z wyzwaniami i presją (przykłady z CV)": 1,
        "Współpraca w zespole i komunikacja (w kontekście ról z CV)": 1
      };
    } else if (group === 4) { 
      categories = {
        "Cele zawodowe kandydata i ich powiązanie z ofertą (w oparciu o CV)": 2,
        "Autorefleksja kandydata na temat swojego doświadczenia z CV (np. wnioski, czego się nauczył)": 2,
        "Pytania pogłębiające konkretne aspekty CV lub dopasowania do firmy": 1
      };
    }
  } else {
    // Istniejące kategorie dla grup 1-3, gdy CV NIE jest dostępne
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
        "Pytania behawioralne i sytuacyjne": 1,
        "Motywację i dopasowanie do firmy": 1,
        "Oczekiwania i plany zawodowe": 2
      };
    }
  }

  const categoriesText = Object.entries(categories)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => `- ${category} (${count} ${count === 1 ? 'pytanie' : 'pytania'})`)
    .join('\n');

  let cvDataText = "";
  if (cvAvailable && cv_data) {
    if (cv_data.experience && cv_data.experience.length > 0) {
      cvDataText += "\n\nDOŚWIADCZENIE ZAWODOWE Z CV:\n";
      cv_data.experience.forEach((exp: any, index: number) => {
        if (exp.company && exp.position) {
          cvDataText += `${index + 1}. Firma: ${exp.company}, Stanowisko: ${exp.position}, `;
          cvDataText += `Okres: ${exp.startDate || "bd"} - ${exp.endDate || "obecnie"}\n`;
          if (exp.description) cvDataText += `   Opis: ${exp.description}\n`;
        }
      });
    }
    if (cv_data.skills && cv_data.skills.technical && cv_data.skills.technical.length > 0) {
      cvDataText += "\n\nUMIEJĘTNOŚCI TECHNICZNE Z CV:\n";
      cv_data.skills.technical.forEach((skill: string, index: number) => {
        cvDataText += `${index + 1}. ${skill}\n`;
      });
    }
    if (cv_data.skills && cv_data.skills.soft && cv_data.skills.soft.length > 0) {
      cvDataText += "\n\nUMIEJĘTNOŚCI MIĘKKIE Z CV:\n";
      cv_data.skills.soft.forEach((skill: string, index: number) => {
        cvDataText += `${index + 1}. ${skill}\n`;
      });
    }
    if (cv_data.education && cv_data.education.length > 0) {
      cvDataText += "\n\nWYKSZTAŁCENIE Z CV:\n";
      cv_data.education.forEach((edu: any, index: number) => {
        if (edu.school && edu.degree) {
          cvDataText += `${index + 1}. Szkoła: ${edu.school}, Stopień: ${edu.degree}, `;
          cvDataText += `Okres: ${edu.startDate || "bd"} - ${edu.endDate || "obecnie"}\n`;
          if (edu.description) cvDataText += `   Opis: ${edu.description}\n`;
        }
      });
    }
    if (cv_data.courses && cv_data.courses.length > 0) {
      cvDataText += "\n\nKURSY I CERTYFIKATY Z CV:\n";
      cv_data.courses.forEach((course: any, index: number) => {
        if (course.name) {
          cvDataText += `${index + 1}. Nazwa: ${course.name}`;
          if (course.organizer) cvDataText += `, Organizator: ${course.organizer}`;
          if (course.date) cvDataText += `, Data: ${course.date}`;
          cvDataText += "\n";
        }
      });
    }
  }

  const systemInstruction = `
    Jesteś ekspertem HR specjalizującym się w rekrutacji. Tworzysz profesjonalne pytania rekrutacyjne, które są precyzyjne, zgodne z najlepszymi praktykami i dostosowane do stanowiska oraz firmy. 
    Zawsze zwracaj odpowiedź w formacie JSON zgodnym z podanym schematem.
  `;

  const questionStartId = (group - 1) * 5 + 1;
  const questionEndId = group * 5;

  let userPrompt = `
Wygeneruj DOKŁADNIE 5 profesjonalnych pytań rekrutacyjnych dla stanowiska ${title} w firmie ${company}.
Jest to część ${group} z ${totalParts} procesu generowania pytań.
Pytania dla tej części powinny obejmować następujące kategorie (skup się głównie na nich):
${categoriesText}

Opis stanowiska: ${full_description}
`;

  if (cvAvailable && cvDataText) {
    userPrompt += `

DANE Z CV KANDYDATA (użyj tych informacji do sformułowania pytań w ramach powyższych kategorii dla tej części):
${cvDataText}

Instrukcje dodatkowe dla tej części (${group}/${totalParts}): 
Twoim zadaniem jest wygenerowanie pytań, które są spójne z podanymi kategoriami dla tej części. Jeśli to możliwe, pytania powinny bezpośrednio odnosić się do konkretnych informacji z CV kandydata, analizując je w kontekście oferty pracy. Pytania muszą być unikalne dla tej części i nie mogą powielać pytań z potencjalnych poprzednich lub przyszłych części generowania. Upewnij się, że liczba pytań w danej kategorii jest zgodna z podaną w sekcji kategorii.
`;
  } else {
    userPrompt += `

Instrukcje dodatkowe dla tej części (${group}/${totalParts}): 
Twoim zadaniem jest wygenerowanie pytań, które są spójne z podanymi kategoriami dla tej części. Pytania muszą być unikalne dla tej części i nie mogą powielać pytań z potencjalnych poprzednich lub przyszłych części generowania. Upewnij się, że liczba pytań w danej kategorii jest zgodna z podaną w sekcji kategorii.
`;
  }

  userPrompt += `
Dla każdego pytania dodaj 3 krótkie wskazówki dla kandydata, jak najlepiej odpowiedzieć.
WAŻNE: Numeruj pytania od ${questionStartId} do ${questionEndId}. Każde pytanie musi mieć unikalne ID w tym zakresie.
Odpowiedz w formacie JSON:
{
  "questions": [
    { "id": ${questionStartId}, "question": "Treść pierwszego pytania (ID=${questionStartId})", "tips": ["Wskazówka 1", "Wskazówka 2", "Wskazówka 3"] },
    { "id": ${questionStartId + 1}, "question": "Treść drugiego pytania (ID=${questionStartId + 1})", "tips": ["Wskazówka 1", "Wskazówka 2", "Wskazówka 3"] }
    // ... i tak dalej, aż do pytania z id ${questionEndId} (łącznie 5 pytań)
  ]
}
`;

  const combinedPrompt = `${systemInstruction}\n\n${userPrompt}`;
  console.log(`Generowanie pytań (grupa ${group}/${totalParts}) dla ${company} - ${title}${cvAvailable ? ' (z uwzględnieniem CV)' : ''}`);
  
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: combinedPrompt }],
    });

    console.log(`--- Statystyki użycia tokenów dla generowanych pytań (grupa ${group}/${totalParts}) ---`);
    logTokenUsage(result);
    
    const { inputTokens, outputTokens } = getUsageMetadata(result);

    // Odczyt textu z odpowiedzi - dostęp do `candidates` jest bardziej standardowy
    const mainResponse: any = (result as any).response || result;
    const text = mainResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'API Gemini zwróciło pustą odpowiedź lub nie udało się odczytać tekstu.', questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }

    const jsonMatch = text.match(/\{[\S\s]*"questions"[\S\s]*\}/);
    if (!jsonMatch) {
      console.error('Odpowiedź z Gemini nie zawiera poprawnego JSON:', text);
      return NextResponse.json(
        { success: false, error: 'Brak poprawnej struktury JSON w odpowiedzi API.', questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }

    let parsedData: GeminiApiResponse;
    try {
      parsedData = JSON.parse(jsonMatch[0]);
    } catch (parseError: any) {
      console.error('Błąd parsowania JSON z odpowiedzi Gemini:', parseError.message);
      console.error('Fragment JSON:', jsonMatch[0].substring(0, 500) + "...");
      return NextResponse.json(
        { success: false, error: `Błąd parsowania odpowiedzi JSON: ${parseError.message}`, questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }
    
    if (!Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
       console.warn('Odpowiedź API nie zawiera pytań lub tablica pytań jest pusta.', parsedData);
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowa struktura danych (brak tablicy "questions" lub jest pusta).', questions: [] } as AppApiResponse,
        { status: 500 }
      );
    }
    
    if (parsedData.questions.length !== 5) {
      console.warn(`API zwróciło ${parsedData.questions.length} pytań zamiast 5.`, parsedData.questions);
    }
    parsedData.questions.forEach(q => {
      if (q.id < questionStartId || q.id > questionEndId) {
        console.warn(`API zwróciło pytanie z nieprawidłowym ID: ${q.id}. Oczekiwano ID w zakresie ${questionStartId}-${questionEndId}.`, q);
      }
    });

    return NextResponse.json({ 
      success: true, 
      questions: parsedData.questions,
      group: group,
      totalGroups: totalParts,
      inputTokens: inputTokens,
      outputTokens: outputTokens
    });
  } catch (error: any) {
    console.error('Pełny błąd API Gemini:', error);
    return NextResponse.json(
      { success: false, error: `Błąd serwera podczas komunikacji z API Gemini: ${error.message || 'Nieznany błąd API'}`, questions: [] } as AppApiResponse,
      { status: 500 }
    );
  }
}
