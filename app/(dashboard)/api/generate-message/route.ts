import { NextRequest, NextResponse } from 'next/server';
import { genAI, createModel, logTokenUsage } from '@/lib/gemini-client'; // Zakładając, że genAI jest wyeksportowane lub createModel radzi sobie z inicjalizacją

// Interfejsy dla danych wejściowych
interface JobOfferData {
  id: string;
  title: string;
  company: string;
  full_description?: string; // Pełny opis oferty, jeśli dostępny
}

// Uproszczona struktura danych CV na podstawie analizy endpointu analyze-cv i schematu SQL (kolumna cv_data w user_cvs)
interface CVProfileData {
  personalData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  description?: string; // Podsumowanie zawodowe z CV
  experience?: Array<{
    position?: string;
    company?: string;
    description?: string; // Opis obowiązków/osiągnięć
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
    // Można rozważyć dodanie języków, jeśli będą potrzebne
    // languages?: Array<{ language?: string; level?: string }>;
  };
  // Można rozważyć dodanie edukacji lub kursów, jeśli będą potrzebne
  // education?: Array<{ school?: string; degree?: string; description?: string }>;
  // courses?: Array<{ name?: string; organizer?: string; date?: string; description?: string }>;
}

interface GenerateMessageRequest {
  jobOffer: JobOfferData;
  cvData?: CVProfileData;
  additionalInfo?: string;
  messageType: string; // np. 'greeting', 'followup', 'thank-you', 'linkedin-footer', 'direct-recruiter'
}

// Funkcja pomocnicza do generowania specyficznych instrukcji dla AI na podstawie typu wiadomości
function getSpecificInstructions(messageType: string, cvAvailable: boolean): string {
  switch (messageType) {
    case 'greeting':
      return `Cel: Napisz formalną, ale entuzjastyczną wiadomość powitalną (list motywacyjny) do pracodawcy.
Jako kandydat, przedstaw swoje zainteresowanie stanowiskiem.
${cvAvailable ? 'Wykorzystaj dostarczone dane z CV, aby podkreślić dopasowanie (doświadczenie, umiejętności) do oferty pracy. ' : ''}
Nawiąż do kluczowych wymagań z opisu stanowiska.
Zakończ prośbą o możliwość rozmowy.`;
    case 'followup':
      return `Cel: Napisz uprzejme zapytanie o status aplikacji po wysłaniu CV lub po rozmowie kwalifikacyjnej.
Wiadomość powinna być krótka i konkretna. Przypomnij o jakie stanowisko chodzi.`;
    case 'thank-you':
      return `Cel: Napisz podziękowanie po odbytej rozmowie kwalifikacyjnej.
Podkreśl swoje zainteresowanie stanowiskiem i firmą. Możesz wspomnieć o konkretnym aspekcie rozmowy, który zrobił na Tobie wrażenie.`;
    case 'feedback':
      return `Cel: Napisz prośbę o informację zwrotną (feedback) po zakończonym procesie rekrutacyjnym, jeśli nie otrzymałeś oferty.
Wiadomość powinna być profesjonalna i wyrażać chęć rozwoju.`;
    case 'clarification':
      return `Cel: Poproś o doprecyzowanie pewnych kwestii dotyczących oferty pracy lub zakresu obowiązków przed formalnym aplikowaniem.
Sformułuj pytania jasno i zwięźle.`;
    case 'welcome': // Wiadomość po otrzymaniu oferty
      return `Cel: Napisz wiadomość z podziękowaniem za otrzymaną ofertę pracy i potwierdzeniem jej przyjęcia (lub prośbą o czas do namysłu).
Wyraź entuzjazm związany z dołączeniem do zespołu.`;
    case 'linkedin-footer':
      return `Cel: Stwórz krótki, profesjonalny opis do sekcji "O mnie" lub stopki na profilu LinkedIn.
${cvAvailable ? 'Powinien bazować na danych z CV (np. aktualne stanowisko, kluczowe umiejętności, podsumowanie zawodowe). ' : ''}
Skup się na zwięzłym przedstawieniu profilu zawodowego. Dodaj odpowiednie hashtagi, jeśli uznasz to za stosowne.`;
    case 'direct-recruiter':
      return `Cel: Napisz krótką, bezpośrednią wiadomość do rekrutera wyrażającą zainteresowanie konkretną ofertą pracy lub nawiązaniem kontaktu.
${cvAvailable ? 'Przedstaw się zwięźle, wykorzystując kluczowe informacje z CV (np. główne obszary specjalizacji, lata doświadczenia). ' : ''}
Wiadomość powinna być spersonalizowana i zachęcająca do odpowiedzi.`;
    default:
      return 'Cel: Wygeneruj profesjonalną wiadomość związaną z procesem rekrutacyjnym, zgodnie z podanymi informacjami.';
  }
}

export async function POST(req: NextRequest) {
  console.log("🚀 API /generate-message: Rozpoczęcie generowania wiadomości");
  const startTime = Date.now();

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ API /generate-message: Brak klucza API Gemini (GEMINI_API_KEY)");
    return NextResponse.json(
      { error: "Brak klucza API dla Gemini. Skonfiguruj zmienną środowiskową GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const requestData = (await req.json()) as GenerateMessageRequest;
    const { jobOffer, cvData, additionalInfo, messageType } = requestData;

    // Walidacja podstawowych danych
    if (!jobOffer || !jobOffer.title || !jobOffer.company || !messageType) {
      console.error("❌ API /generate-message: Brak wymaganych pól w żądaniu (jobOffer.title, jobOffer.company, messageType)");
      return NextResponse.json(
        { error: "Brak wymaganych pól: jobOffer (z title i company) oraz messageType." },
        { status: 400 }
      );
    }
    
    console.log(`📄 API /generate-message: Typ wiadomości: ${messageType}, Oferta: ${jobOffer.title} w ${jobOffer.company}`);

    // Przygotowanie fragmentu promptu z danymi CV (jeśli typ wiadomości tego wymaga i dane są dostępne)
    let cvInfoText = "";
    const cvRelevantMessageTypes = ['greeting', 'linkedin-footer', 'direct-recruiter'];
    const cvAvailable = !!cvData && Object.keys(cvData).length > 0;

    if (cvAvailable && cvRelevantMessageTypes.includes(messageType)) {
      let parts: string[] = [];
      if (cvData?.personalData?.firstName || cvData?.personalData?.lastName) {
        parts.push(`Kandydat: ${cvData.personalData.firstName || ''} ${cvData.personalData.lastName || ''}`.trim());
      }
      if (cvData?.description) {
        parts.push(`Podsumowanie zawodowe: ${cvData.description}`);
      }
      if (cvData?.experience && cvData.experience.length > 0) {
        const latestExp = cvData.experience[0];
        let expStr = `Doświadczenie: ${latestExp.position || 'Brak danych o stanowisku'} w ${latestExp.company || 'Brak danych o firmie'}.`;
        if (latestExp.description) {
           expStr += ` Główne zadania/osiągnięcia: ${latestExp.description.substring(0,150)}...`; // Skrócony opis
        }
        parts.push(expStr);
      }
      if (cvData?.skills?.technical && cvData.skills.technical.length > 0) {
        parts.push(`Umiejętności techniczne: ${cvData.skills.technical.slice(0, 5).join(', ')}.`);
      }
      if (cvData?.skills?.soft && cvData.skills.soft.length > 0) {
        parts.push(`Umiejętności miękkie: ${cvData.skills.soft.slice(0, 3).join(', ')}.`);
      }
      if (parts.length > 0) {
        cvInfoText = "KONTEKST Z CV KANDYDATA:\n" + parts.map(p => `- ${p}`).join("\n");
      }
    }
    
    const systemInstruction = `Jesteś Asystentem AI specjalizującym się w tworzeniu profesjonalnych, zwięzłych i skutecznych wiadomości e-mail oraz innych tekstów użytkowych związanych z procesem rekrutacji i rozwojem kariery. Twoim zadaniem jest generowanie treści wiadomości na podstawie dostarczonych danych. Odpowiadaj wyłącznie treścią generowanej wiadomości, bez żadnych dodatkowych komentarzy, wstępów czy znaczników markdown (chyba że są częścią formatowania wiadomości, np. lista). Ton powinien być profesjonalny i dostosowany do kontekstu typu wiadomości.`;

    const model = createModel("gemini-2.0-flash", systemInstruction); // Użycie gemini-pro dla lepszej jakości generowania tekstu

    const specificInstructions = getSpecificInstructions(messageType, cvAvailable && cvRelevantMessageTypes.includes(messageType));

    const promptLines = [
      `Wygeneruj wiadomość zgodnie z poniższymi wytycznymi.`,
      `TYP WIADOMOŚCI DO WYGENEROWANIA: "${messageType}"`,
      `\nSZCZEGÓŁY OFERTY PRACY:`,
      `- Stanowisko: ${jobOffer.title}`,
      `- Firma: ${jobOffer.company}`,
      jobOffer.full_description ? `- Pełny opis stanowiska: ${jobOffer.full_description}` : '',
      cvInfoText ? `\n${cvInfoText}` : '',
      additionalInfo ? `\nDODATKOWE INFORMACJE OD UŻYTKOWNIKA (uwzględnij je w treści wiadomości):\n- ${additionalInfo}` : '\nDodatkowe informacje od użytkownika: Brak.',
      `\nINSTRUKCJE SPECYFICZNE DLA TYPU WIADOMOŚCI "${messageType}":`,
      specificInstructions,
      `\n---`,
      `OCZEKIWANA WIADOMOŚĆ (sama treść, bez dodatkowych komentarzy):`
    ];

    const fullPrompt = promptLines.filter(line => line !== '').join("\n");
    
    console.log("📋 API /generate-message: Przygotowany prompt (pierwsze 300 znaków):", fullPrompt.substring(0,300) + "...");

    const generationResult = await model.generateContent(fullPrompt);
    // Dostęp do odpowiedzi może się różnić w zależności od wersji SDK Gemini
    // const response = await generationResult.response;
    // const generatedText = response.text();
    // Lub bardziej ogólnie:
     const response = (generationResult as any).response || generationResult; // Dla kompatybilności
     const candidates = response.candidates;
     if (!candidates || candidates.length === 0 || !candidates[0].content || !candidates[0].content.parts || candidates[0].content.parts.length === 0) {
        console.error("❌ API /generate-message: Nieoczekiwana struktura odpowiedzi z Gemini", candidates);
        throw new Error("Nie udało się uzyskać treści z modelu Gemini: Nieprawidłowa struktura odpowiedzi.");
     }
     const generatedText = candidates[0].content.parts[0].text.trim();


    console.log("💬 API /generate-message: Wygenerowany tekst (pierwsze 300 znaków):", generatedText.substring(0,300) + "...");
    
    const tokenUsage = logTokenUsage(response); // logTokenUsage oczekuje obiektu z usageMetadata

    const endTime = Date.now();
    console.log(`✅ API /generate-message: Wiadomość wygenerowana w ${(endTime - startTime) / 1000}s`);

    return NextResponse.json({
      success: true,
      message: generatedText,
      tokenUsage,
      messageType,
    });

  } catch (error: any) {
    console.error("❌ API /generate-message: Błąd podczas generowania wiadomości:", error);
    const endTime = Date.now();
    console.log(`❌ API /generate-message: Generowanie zakończone błędem po ${(endTime - startTime) / 1000}s`);
    return NextResponse.json(
      {
        success: false,
        error: "Wystąpił błąd podczas generowania wiadomości.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
} 