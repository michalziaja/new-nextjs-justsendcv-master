import { NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// Sprawdzamy dostępność klucza API w sposób bardziej widoczny
const apiKey = process.env.GEMINI_API_KEY || '';
console.log(`Klucz API Gemini dostępny: ${apiKey ? 'TAK' : 'NIE'}`);

if (!apiKey) {
  console.error('❌ BŁĄD: Brak klucza API Gemini (GEMINI_API_KEY)!');
}

// Inicjalizacja klienta Google Gen AI tylko gdy klucz jest dostępny
let ai: any = null;
try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
    console.log('✅ Klient GoogleGenAI zainicjalizowany');
  }
} catch (error) {
  console.error('❌ Błąd inicjalizacji GoogleGenAI:', error);
}

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

// Funkcja pomocnicza do generowania przykładowych pytań (awaryjnie)
function generateFallbackQuestions(position: string, companyName: string): Question[] {
  return [
    {
      id: 1,
      question: `Jakie doświadczenie w zakresie ${position} Pan/Pani posiada?`,
      tips: [
        "Skup się na najbardziej istotnych doświadczeniach",
        "Podaj konkretne przykłady projektów",
        "Wymień umiejętności, które są istotne dla tego stanowiska",
        "Wspomnij o sukcesach w poprzednich rolach"
      ]
    },
    {
      id: 2,
      question: `Dlaczego chce Pan/Pani pracować w firmie ${companyName}?`,
      tips: [
        "Pokaż, że znasz firmę i jej wartości",
        "Wyjaśnij, jak Twoje cele zawodowe są zgodne z firmą",
        "Podkreśl aspekty kultury firmy, które Ci odpowiadają",
        "Bądź szczery i autentyczny w swojej motywacji"
      ]
    },
    {
      id: 3,
      question: "Jak radzi sobie Pan/Pani w sytuacjach stresowych?",
      tips: [
        "Podaj konkretny przykład trudnej sytuacji z przeszłości",
        "Opisz kroki, które podjąłeś/podjęłaś, aby poradzić sobie ze stresem",
        "Wyjaśnij, jakie techniki stosujesz do zarządzania stresem",
        "Podkreśl swoje umiejętności adaptacji i rozwiązywania problemów"
      ]
    }
  ];
}

export async function POST(req: Request) {
  console.log('🔄 Rozpoczęcie obsługi żądania POST do /api/interview-questions');
  
  if (!apiKey || !ai) {
    console.error('❌ Brak klucza API lub klient nie został zainicjalizowany');
    return NextResponse.json({
      success: true, // Oznaczamy jako sukces, aby nie przerywać flow aplikacji
      error: 'Konfiguracja API niekompletna: Brak klucza API Gemini',
      questions: generateFallbackQuestions("tego stanowiska", "tej firmie")  // Zwracamy awaryjne pytania
    });
  }

  try {
    // Debugowanie nagłówków i metody żądania 
    console.log('Metoda żądania:', req.method);
    console.log('Nagłówki żądania:', Object.fromEntries(req.headers.entries()));
    
    // Sprawdzamy, czy request jest prawidłowy JSON
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('❌ Błąd parsowania JSON z body:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Nieprawidłowy format danych',
        questions: generateFallbackQuestions("tego stanowiska", "tej firmie")
      }, { status: 400 });
    }
    
    const { companyName, position, description } = body;
    console.log(`📝 Otrzymano dane: firma=${companyName}, stanowisko=${position}`);
    
    if (!companyName || !position) {
      console.warn('⚠️ Brak nazwy firmy lub stanowiska');
      return NextResponse.json({ 
        success: false, 
        error: 'Brak nazwy firmy lub stanowiska',
        questions: generateFallbackQuestions("tego stanowiska", "tej firmie") 
      }, { status: 400 });
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
      try {
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

        console.log('📝 Wysyłanie zapytania do Gemini API');
        
        // Spróbuj użyć API Gemini - dodajemy obsługę błędu CORS
        try {
          // Dodajemy timeout na wypadek, gdyby API nie odpowiedziało
          const timeoutPromise = new Promise<GenerateContentResponse | null>((resolve) => {
            setTimeout(() => {
              console.warn('⚠️ Timeout - brak odpowiedzi z Gemini API');
              resolve(null);
            }, 15000); // 15 sekund timeout
          });

          // Wywołujemy faktyczne zapytanie do Gemini
          const apiPromise = ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ text: prompt }],
          });
          
          // Używamy Promise.race aby obsłużyć timeout
          const result = await Promise.race([apiPromise, timeoutPromise]);
          
          if (!result) {
            throw new Error('Timeout - API nie odpowiada w oczekiwanym czasie');
          }

          const candidates = result.candidates;
          if (!candidates || candidates.length === 0) {
            console.warn('⚠️ Brak kandydatów w odpowiedzi Gemini, używam zapasowych pytań');
            return NextResponse.json({
              success: true,
              questions: generateFallbackQuestions(position, companyName)
            });
          }

          const first = candidates[0];
          const text = first.content?.parts?.[0]?.text || '';

          if (!text.trim()) {
            console.warn("⚠️ Gemini nie wygenerowało tekstu, używam zapasowych pytań");
            return NextResponse.json({
              success: true,
              questions: generateFallbackQuestions(position, companyName)
            });
          }

          console.log("✅ Wygenerowano tekst z pytaniami rekrutacyjnymi");
          
          // Próba parsowania JSON z odpowiedzi tekstowej
          try {
            // Szukanie obiektu JSON w tekście (może być poprzedzony lub zakończony dodatkowym tekstem)
            const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
            
            if (jsonMatch) {
              const jsonStr = jsonMatch[0];
              const parsedData: QuestionsResponse = JSON.parse(jsonStr);
              
              console.log("✅ Zparsowano JSON z pytaniami rekrutacyjnymi");
              
              return NextResponse.json({
                success: true,
                questions: parsedData.questions
              });
            } else {
              console.warn("⚠️ Nie znaleziono obiektu JSON w odpowiedzi, używam zapasowych pytań");
              console.log("Odpowiedź API:", text);
              return NextResponse.json({
                success: true,
                questions: generateFallbackQuestions(position, companyName)
              });
            }
          } catch (parseError) {
            console.error("❌ Błąd parsowania JSON:", parseError);
            // Zapisujemy pełną odpowiedź API do debugowania
            console.log("Odpowiedź API:", text);
            return NextResponse.json({
              success: true,
              questions: generateFallbackQuestions(position, companyName)
            });
          }
        } catch (geminiError) {
          console.error("❌ Błąd Gemini API:", geminiError);
          // W przypadku awarii API Gemini, zwracamy awaryjne pytania
          return NextResponse.json({
            success: true,
            questions: generateFallbackQuestions(position, companyName)
          });
        }
      } catch (innerError) {
        console.error("❌ Wewnętrzny błąd podczas przetwarzania zapytania:", innerError);
        return NextResponse.json({
          success: true,
          questions: generateFallbackQuestions(position, companyName)
        });
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
    
    // W przypadku jakiegokolwiek błędu zwracamy awaryjne pytania zamiast błędu
    try {
      const body = await req.json();
      const { companyName = "tej firmie", position = "tego stanowiska" } = body;
      
      return NextResponse.json({
        success: true,
        questions: generateFallbackQuestions(position, companyName)
      });
    } catch (parseError) {
      // Jeśli nawet nie możemy odczytać body, używamy domyślnych wartości
      return NextResponse.json({
        success: true,
        questions: generateFallbackQuestions("tego stanowiska", "tej firmie")
      });
    }
  }
}