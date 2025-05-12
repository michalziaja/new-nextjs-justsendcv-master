import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Sprawdzamy, czy klucz API jest dostępny
const apiKey = process.env.GEMINI_API_KEY;

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
    1. Analizuj tekst szczegółowo, identyfikując dane osobowe, doświadczenie zawodowe, wykształcenie, kursy, umiejętności itp.
    2. Ignoruj informacje o RODO/zgodach na przetwarzanie danych.
    3. Rozróżnij między doświadczeniem zawodowym a projektami.
    4. Zwróć uwagę na daty i formatuj je jako "MM.YYYY" lub "YYYY".
    5. Zwróć tylko strukturę JSON bez dodatkowych komentarzy.
    6. Jeśli nie możesz określić jakiejś wartości, użyj pustego ciągu znaków lub tablicy.
    7. Dla linków społecznościowych określ typ (linkedin, github, portfolio, twitter, facebook, instagram) i ustaw pole include na true.
    
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
          "startDate": "",
          "endDate": "",
          "description": "",
          "type": "job"
        }
      ],
      "education": [
        {
          "school": "",
          "degree": "",
          "startDate": "",
          "endDate": "",
          "description": ""
        }
      ],
      "courses": [
        {
          "name": "",
          "organizer": "",
          "date": "",
          "certificateNumber": "",
          "description": ""
        }
      ],
      "skills": {
        "technical": ["", ""],
        "soft": ["", ""],
        "languages": [
          {
            "language": "",
            "level": ""
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
      console.log(responseText.substring(0, 500) + "...");

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
        
        // Pokażmy liczbę pól w każdej sekcji
        console.log("📊 Statystyka wyodrębnionych danych:");
        console.log(`- Dane osobowe: ${Object.keys(parsedData.personalData).length} pól`);
        console.log(`- Linki społecznościowe: ${parsedData.personalData.socialLinks?.length || 0}`);
        console.log(`- Doświadczenie: ${parsedData.experience?.length || 0} pozycji`);
        console.log(`- Edukacja: ${parsedData.education?.length || 0} pozycji`);
        console.log(`- Kursy: ${parsedData.courses?.length || 0} pozycji`);
        console.log(`- Umiejętności techniczne: ${parsedData.skills?.technical?.length || 0}`);
        console.log(`- Umiejętności miękkie: ${parsedData.skills?.soft?.length || 0}`);
        console.log(`- Języki: ${parsedData.skills?.languages?.length || 0}`);
        
        const endTime = Date.now();
        console.log(`✅ Analiza CV zakończona pomyślnie w ${(endTime - startTime) / 1000} sekund`);
        
        // Zwrócenie sparsowanych danych
        return NextResponse.json(parsedData);
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
          model: 'gemini-pro',
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
        
        const endTime = Date.now();
        console.log(`✅ Analiza CV (model alternatywny) zakończona pomyślnie w ${(endTime - startTime) / 1000} sekund`);
        
        return NextResponse.json(parsedData);
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