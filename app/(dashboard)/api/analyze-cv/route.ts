import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Sprawdzamy, czy klucz API jest dostępny
const apiKey = process.env.GEMINI_API_KEY;

// Funkcja do postprocessingu danych po analizie AI
function postProcessData(data: any) {
  // Funkcja do naprawy polskich znaków
  const fixPolishChars = (text: string): string => {
    if (!text || typeof text !== 'string') return text;
    
    return text
      .replace(/\s+/g, ' ') // Usuń wielokrotne spacje
      .replace(/([a-zA-Z])\s+([ąćęłńóśźż])/gi, '$1$2') // Napraw rozdzielone polskie znaki
      .replace(/([ąćęłńóśźż])\s+([a-zA-Z])/gi, '$1$2') // Napraw rozdzielone polskie znaki
      .replace(/\s*([ąćęłńóśźż])\s*/gi, '$1') // Usuń spacje wokół polskich znaków
      .trim();
  };

  // Funkcja do formatowania dat
  const formatDate = (dateStr: string): string => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    const cleaned = dateStr.trim().toLowerCase();
    
    // Jeśli to już prawidłowy format YYYY-MM lub YYYY
    if (/^\d{4}-\d{2}$/.test(cleaned) || /^\d{4}$/.test(cleaned)) {
      return cleaned;
    }
    
    // Mapowanie miesięcy polskich
    const months: { [key: string]: string } = {
      'styczeń': '01', 'stycznia': '01', 'jan': '01',
      'luty': '02', 'lutego': '02', 'feb': '02',
      'marzec': '03', 'marca': '03', 'mar': '03',
      'kwiecień': '04', 'kwietnia': '04', 'kwi': '04',
      'maj': '05', 'maja': '05',
      'czerwiec': '06', 'czerwca': '06', 'cze': '06',
      'lipiec': '07', 'lipca': '07', 'lip': '07',
      'sierpień': '08', 'sierpnia': '08', 'sie': '08',
      'wrzesień': '09', 'września': '09', 'wrz': '09',
      'październik': '10', 'października': '10', 'paź': '10',
      'listopad': '11', 'listopada': '11', 'lis': '11',
      'grudzień': '12', 'grudnia': '12', 'gru': '12'
    };
    
    // Sprawdź różne formaty dat
    const yearMatch = cleaned.match(/(\d{4})/);
    if (!yearMatch) return '';
    
    const year = yearMatch[1];
    
    // Szukaj miesiąca w tekście
    for (const [monthName, monthNum] of Object.entries(months)) {
      if (cleaned.includes(monthName)) {
        return `${year}-${monthNum}`;
      }
    }
    
    // Jeśli nie znaleziono miesiąca, zwróć sam rok
    return year;
  };

  // Funkcja do formatowania opisów z bullet points
  const formatDescription = (desc: string): string => {
    if (!desc || typeof desc !== 'string') return desc;
    
    return fixPolishChars(desc)
      .replace(/•\s*/g, '\n') // Zamień bullet points na nowe linie
      .replace(/\s*-\s*/g, '\n') // Zamień myślniki na nowe linie
      .replace(/\s*\*\s*/g, '\n') // Zamień gwiazdki na nowe linie
      .replace(/^\n+/, '') // Usuń początkowe nowe linie
      .replace(/\n+/g, '\n') // Usuń wielokrotne nowe linie
      .trim();
  };

  // Rekursywnie przetwarzaj obiekt
  const processObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(processObject);
    } else if (obj && typeof obj === 'object') {
      const processed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'startDate' || key === 'endDate' || key === 'date') {
          processed[key] = formatDate(value as string);
        } else if (key === 'description') {
          processed[key] = formatDescription(value as string);
        } else if (typeof value === 'string') {
          processed[key] = fixPolishChars(value);
        } else {
          processed[key] = processObject(value);
        }
      }
      return processed;
    }
    return obj;
  };

  return processObject(data);
}

// Funkcja odpowiedzialna za analizę CV
export async function POST(req: NextRequest) {
  console.log("🚀 Rozpoczęcie analizy CV przez API Gemini");
  const startTime = Date.now();
  
  try {
    // Sprawdzenie, czy mamy klucz API
    if (!apiKey) {
      console.error("❌ Brak klucza API dla Gemini");
      return NextResponse.json(
        { error: 'Brak klucza API dla Gemini. Skonfiguruj zmienną środowiskową GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    // Pobieranie danych z żądania
    const data = await req.json();
    const { text } = data;

    if (!text || typeof text !== 'string') {
      console.error("❌ Brak tekstu CV lub nieprawidłowy format");
      return NextResponse.json(
        { error: 'Brak tekstu CV do analizy lub nieprawidłowy format.' },
        { status: 400 }
      );
    }

    console.log(`📝 Otrzymano tekst CV o długości ${text.length} znaków`);
    
    // Inicjalizacja API Gemini z odpowiednią wersją API
    console.log("🔄 Inicjalizacja klienta Gemini API");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Konfiguracja modelu - używamy nowszego modelu gemini-1.5-pro, który jest bardziej zaawansowany
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      // Ustawiamy niską temperaturę dla bardziej przewidywalnych wyników i zwiększamy limit tokenów
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      }
    });

    // Przygotowanie promptu z instrukcjami dla modelu
    console.log("📋 Przygotowywanie promptu dla modelu Gemini");
    const prompt = `
    Przeanalizuj poniższy tekst CV i wyodrębnij odpowiednie informacje w formacie JSON.
    
    # Instrukcje:
    1. WAŻNE: Zachowaj wszystkie polskie znaki (ą, ć, ę, ł, ń, ó, ś, ź, ż) i usuń niepotrzebne spacje między literami.
    2. Analizuj tekst szczegółowo, identyfikując dane osobowe, doświadczenie zawodowe, wykształcenie, kursy, umiejętności itp.
    3. Ignoruj informacje o RODO/zgodach na przetwarzanie danych.
    4. Rozróżnij między doświadczeniem zawodowym a projektami.
    5. FORMATOWANIE DAT: Konwertuj wszystkie daty do formatu YYYY-MM (np. "2023-01") lub YYYY (np. "2023"). Jeśli data zawiera "obecnie" lub "aktualnie", użyj pustego ciągu znaków dla endDate.
    6. FORMATOWANIE OPISÓW: Jeśli opis zawiera bullet points (•, -, *) lub wyliczenia, rozdziel każdy punkt nową linią (\\n). Usuń znaki bullet points.
    7. Zwróć tylko strukturę JSON bez dodatkowych komentarzy.
    8. Jeśli nie możesz określić jakiejś wartości, użyj pustego ciągu znaków lub tablicy.
    9. Dla linków społecznościowych określ typ (linkedin, github, portfolio, twitter, facebook, instagram) i ustaw pole include na true.
    10. Popraw wszystkie błędy kodowania znaków w tekście polskim.
    
    # Przykłady formatowania:
    - Data: "styczeń 2023" → "2023-01"
    - Data: "2022-2024" → startDate: "2022-01", endDate: "2024-12"
    - Data: "od 2023" → startDate: "2023-01", endDate: ""
    - Opis z bullet points: 
      "• Punkt pierwszy • Punkt drugi" → "Punkt pierwszy\\nPunkt drugi"
    - Polskie znaki: "zg łę biam" → "zgłębiam"
    
    # Format danych wyjściowych (JSON):
    
    {
      "personalData": {
        "firstName": "",
        "lastName": "",
        "email": "",
        "phone": "",
        "address": "",
        "socialLinks": [
          {
            "type": "linkedin|github|portfolio|twitter|facebook|instagram",
            "url": "",
            "include": true
          }
        ]
      },
      "description": "",
      "experience": [
        {
          "position": "",
          "company": "",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM lub pusty ciąg dla obecnej pracy",
          "description": "Opis z \\n dla nowych linii",
          "type": "job"
        }
      ],
      "education": [
        {
          "school": "",
          "degree": "",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM",
          "description": "Opis z \\n dla nowych linii"
        }
      ],
      "courses": [
        {
          "name": "",
          "organizer": "",
          "date": "YYYY-MM",
          "certificateNumber": "",
          "description": "Opis z \\n dla nowych linii"
        }
      ],
      "skills": {
        "technical": ["umiejętność1", "umiejętność2"],
        "soft": ["umiejętność1", "umiejętność2"],
        "languages": [
          {
            "language": "Język",
            "level": "A1|A2|B1|B2|C1|C2 - Poziom"
          }
        ]
      }
    }
    
    # Tekst CV do analizy:
    ${text}
    `;

    // Wysyłanie zapytania do modelu Gemini z obsługą błędów
    try {
      console.log("🔄 Wysyłanie zapytania do modelu Gemini API");
      const geminiStartTime = Date.now();
      
      // Wywołujemy model z prostym tekstowym promptem
      const result = await model.generateContent(prompt);
      const geminiEndTime = Date.now();
      console.log(`✅ Odpowiedź z Gemini otrzymana w czasie ${(geminiEndTime - geminiStartTime) / 1000} sekund`);
      
      const response = await result.response;
      const responseText = response.text();
      
      console.log("📄 Odpowiedź z Gemini (pierwsze 500 znaków):");
      //console.log(responseText.substring(0, 500) + "...");
      console.log(responseText)
      // Próba sparsowania odpowiedzi jako JSON
      try {
        console.log("🔄 Próba parsowania odpowiedzi jako JSON");
        // Szukanie pierwszego { i ostatniego }
        const jsonStartIndex = responseText.indexOf('{');
        const jsonEndIndex = responseText.lastIndexOf('}') + 1;
        
        if (jsonStartIndex === -1 || jsonEndIndex === 0) {
          console.error("❌ Nie znaleziono prawidłowego formatu JSON w odpowiedzi");
          throw new Error('Nie znaleziono prawidłowego formatu JSON w odpowiedzi.');
        }
        
        const jsonStr = responseText.substring(jsonStartIndex, jsonEndIndex);
        const parsedData = JSON.parse(jsonStr);
        
        // Postprocessing danych - naprawa polskich znaków, dat i formatowania
        const cleanedData = postProcessData(parsedData);
        
        // Pokażmy liczbę pól w każdej sekcji
        console.log("📊 Statystyka wyodrębnionych danych:");
        console.log(`- Dane osobowe: ${Object.keys(cleanedData.personalData).length} pól`);
        console.log(`- Linki społecznościowe: ${cleanedData.personalData.socialLinks?.length || 0}`);
        console.log(`- Doświadczenie: ${cleanedData.experience?.length || 0} pozycji`);
        console.log(`- Edukacja: ${cleanedData.education?.length || 0} pozycji`);
        console.log(`- Kursy: ${cleanedData.courses?.length || 0} pozycji`);
        console.log(`- Umiejętności techniczne: ${cleanedData.skills?.technical?.length || 0}`);
        console.log(`- Umiejętności miękkie: ${cleanedData.skills?.soft?.length || 0}`);
        console.log(`- Języki: ${cleanedData.skills?.languages?.length || 0}`);
        
        const endTime = Date.now();
        console.log(`✅ Analiza CV zakończona pomyślnie w ${(endTime - startTime) / 1000} sekund`);
        
        // Zwrócenie sparsowanych danych
        return NextResponse.json(cleanedData);
      } catch (parseError) {
        console.error('❌ Błąd parsowania JSON z odpowiedzi Gemini:', parseError);
        console.log('📄 Pełna odpowiedź z Gemini:', responseText);
        
        return NextResponse.json(
          {
            error: 'Nie udało się sparsować danych z odpowiedzi modelu Gemini.',
            originalResponse: responseText
          },
          { status: 500 }
        );
      }
    } catch (modelError: any) {
      console.error('❌ Błąd generowania odpowiedzi z modelu Gemini:', modelError);

      // Próba użycia alternatywnego modelu w przypadku błędu
      try {
        console.log('🔄 Próba użycia alternatywnego modelu gemini-pro...');
        const alternativeModel = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        });
        
        const altStartTime = Date.now();
        const result = await alternativeModel.generateContent(prompt);
        const altEndTime = Date.now();
        console.log(`✅ Odpowiedź z alternatywnego modelu Gemini otrzymana w czasie ${(altEndTime - altStartTime) / 1000} sekund`);
        
        const response = await result.response;
        const responseText = response.text();
        
        // Próba sparsowania odpowiedzi z alternatywnego modelu
        const jsonStartIndex = responseText.indexOf('{');
        const jsonEndIndex = responseText.lastIndexOf('}') + 1;
        
        if (jsonStartIndex === -1 || jsonEndIndex === 0) {
          console.error("❌ Nie znaleziono prawidłowego formatu JSON w odpowiedzi alternatywnego modelu");
          throw new Error('Nie znaleziono prawidłowego formatu JSON w odpowiedzi alternatywnego modelu.');
        }
        
        const jsonStr = responseText.substring(jsonStartIndex, jsonEndIndex);
        const parsedData = JSON.parse(jsonStr);
        
        // Postprocessing danych - naprawa polskich znaków, dat i formatowania
        const cleanedData = postProcessData(parsedData);
        
        const endTime = Date.now();
        console.log(`✅ Analiza CV (model alternatywny) zakończona pomyślnie w ${(endTime - startTime) / 1000} sekund`);
        
        return NextResponse.json(cleanedData);
      } catch (alternativeError) {
        console.error('❌ Błąd generowania odpowiedzi z alternatywnego modelu Gemini:', alternativeError);
        
        return NextResponse.json(
          { 
            error: 'Błąd komunikacji z modelami Gemini. Sprawdź klucz API i dostępność modeli.',
            details: modelError?.message || String(modelError) 
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('❌ Błąd podczas przetwarzania zapytania:', error);
    
    const endTime = Date.now();
    console.log(`❌ Analiza CV zakończona niepowodzeniem po ${(endTime - startTime) / 1000} sekundach`);
    
    return NextResponse.json(
      { 
        error: 'Wystąpił nieoczekiwany błąd podczas analizy CV.',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
} 