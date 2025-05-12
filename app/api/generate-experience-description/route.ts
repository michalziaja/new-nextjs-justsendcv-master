import { NextRequest, NextResponse } from "next/server";
import { createModel, logTokenUsage } from "@/lib/gemini-client";

export async function POST(req: NextRequest) {
  console.log("🚀 Rozpoczęcie generowania opisu doświadczenia przez API");
  const startTime = Date.now();
  
  try {
    // Pobieranie danych z żądania
    const data = await req.json();
    const { jobTitle, position, company, description } = data;
    
    if (!description || description.trim().length < 10) {
      console.error("❌ Brak lub zbyt krótki opis doświadczenia");
      return NextResponse.json(
        { error: "Brak lub zbyt krótki opis doświadczenia. Wprowadź przynajmniej kilka słów." },
        { status: 400 }
      );
    }
    
    console.log(`📝 Generowanie opisu doświadczenia dla stanowiska: ${position} w ${company}`);
    
    // Instrukcja systemowa dla modelu
    const SYSTEM_INSTRUCTION = 
      "Jesteś ekspertem w redagowaniu profesjonalnych opisów doświadczenia zawodowego w CV. " +
      "Twoje opisy są konkretne, używają czasowników akcji i podkreślają osiągnięcia. " +
      "Dostosowujesz styl i zawartość do specyfiki stanowiska, o które ubiega się kandydat. " +
      "Zawsze piszesz w pierwszej osobie. Zachowujesz ważne informacje z oryginalnego opisu. " +
      "Tworzysz podpunkty ściśle jeden po drugim, bez dodatkowych pustych linii pomiędzy nimi.";
    
    // Utworzenie modelu
    console.log("🤖 ExperienceDescription: Tworzenie modelu Gemini");
    const model = createModel("gemini-1.5-flash", SYSTEM_INSTRUCTION);
    
    // Przygotowanie promptu
    const userPrompt = `
Ulepsz opis doświadczenia zawodowego na stanowisku "${position}" w firmie "${company}" dla CV.

Oryginalny opis:
"""
${description}
"""

${jobTitle ? `Aplikuję na stanowisko: ${jobTitle}` : ''}

Wytyczne:
- Zachowaj najważniejsze informacje z oryginalnego opisu
- Użyj podpunktów w formacie "• Tekst" bez pustych linii między punktami
- Wszystkie podpunkty muszą być bezpośrednio jeden pod drugim, BEZ pustych linii oddzielających
- Zastosuj konkretne czasowniki akcji (np. wdrożyłem, opracowałem, zarządzałem)
- Podkreśl osiągnięcia, nie tylko obowiązki
- Dodaj metryki lub konkretne rezultaty, jeśli to możliwe
- Dostosuj opis do stanowiska, o które ubiega się kandydat
- Pomiń oczywiste lub rutynowe zadania
- Pisz w pierwszej osobie
- Odpowiedź napisz po polsku
- Zwróć tylko sam opis bez dodatkowych komentarzy

Przykładowy format (BEZ pustych linii między punktami):
• Zarządzałem zespołem 5 programistów, realizując projekty dla klientów z branży finansowej.
• Wdrożyłem nowy system raportowania, który zwiększył wydajność działu o 20%.
• Przeprowadziłem szkolenia techniczne dla pracowników z zakresu nowych technologii.
`;

    // Wywołanie modelu
    console.log("🔄 ExperienceDescription: Wysyłanie zapytania do Gemini...");
    const startTime = Date.now();
    
    try {
      const response = await model.generateContent(userPrompt);
      const endTime = Date.now();
      const elapsedTime = (endTime - startTime) / 1000;
      console.log(`✅ ExperienceDescription: Otrzymano odpowiedź z Gemini (czas: ${elapsedTime}s)`);
      
      const generatedDescription = response.response.text().trim();
      
      if (!generatedDescription || generatedDescription.length === 0) {
        throw new Error("Otrzymano pustą odpowiedź od modelu");
      }
      
      // Dodatkowe przetwarzanie - usuwanie pustych linii między podpunktami
      const processedDescription = generatedDescription
        .replace(/\n\s*\n/g, '\n')  // Usuń puste linie
        .replace(/(\n•)/g, '\n•');   // Zapewnij, że każdy podpunkt zaczyna się od nowej linii
      
      // Logowanie tokenów
      logTokenUsage(response.response);
      
      return NextResponse.json({ description: processedDescription });
      
    } catch (modelError) {
      console.error("❌ ExperienceDescription: Błąd generowania treści przez model:", modelError);
      
      // Obsługa błędów związanych z limitami
      const errorMessage = String(modelError);
      if (errorMessage.toLowerCase().includes("token") || 
          errorMessage.toLowerCase().includes("limit") || 
          errorMessage.toLowerCase().includes("quota")) {
        throw new Error("Przekroczono limit tokenów lub osiągnięto limit zapytań API. Proszę spróbować później.");
      }
      
      throw modelError;
    }
  } catch (error: any) {
    console.error("❌ Błąd generowania opisu doświadczenia:", error);
    
    const endTime = Date.now();
    console.log(`❌ Generowanie opisu zakończone niepowodzeniem po ${(endTime - startTime) / 1000} sekundach`);
    
    return NextResponse.json(
      { 
        error: "Wystąpił błąd podczas generowania opisu doświadczenia.",
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
} 