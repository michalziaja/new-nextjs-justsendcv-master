import { DocumentType, JobOffer } from "./types";

export const generateDocument = (
  documentType: DocumentType,
  jobOffer: JobOffer
): string => {
  const { title: jobTitle, company } = jobOffer;
  
  switch (documentType) {
    case "hr_message":
      return `Szanowny Dziale HR ${company},\n\nPiszę w sprawie ogłoszenia na stanowisko ${jobTitle}. Jestem zainteresowany/a dołączeniem do Państwa zespołu i chciałbym/chciałabym aplikować na to stanowisko.\n\nZ wyrazami szacunku,\n[Twoje imię i nazwisko]`;
    
    case "welcome_message":
      return `Dzień dobry,\n\nZ przyjemnością aplikuję na stanowisko ${jobTitle} w ${company}. Jestem przekonany/a, że moje doświadczenie i umiejętności czynią mnie odpowiednim kandydatem na to stanowisko.\n\nZ poważaniem,\n[Twoje imię i nazwisko]`;
    
    case "status_inquiry":
      return `Szanowny Dziale HR ${company},\n\nChciałbym/chciałabym zapytać o status mojej aplikacji na stanowisko ${jobTitle}. Aplikowałem/am w dniu [data aplikacji].\n\nZ wyrazami szacunku,\n[Twoje imię i nazwisko]`;
    
    case "thank_you":
      return `Dzień dobry,\n\nChciałbym/chciałabym podziękować za możliwość rozmowy o stanowisku ${jobTitle} w ${company}. Spotkanie było bardzo interesujące i informatywne.\n\nZ wyrazami szacunku,\n[Twoje imię i nazwisko]`;
    
    case "feedback_request":
      return `Szanowny Dziale HR ${company},\n\nChciałbym/chciałabym prosić o feedback dotyczący mojej aplikacji na stanowisko ${jobTitle}. Bardzo cenię sobie konstruktywną krytykę, która pomoże mi w rozwoju zawodowym.\n\nZ poważaniem,\n[Twoje imię i nazwisko]`;
    
    case "clarification_request":
      return `Dzień dobry,\n\nZainteresowało mnie ogłoszenie na stanowisko ${jobTitle} w ${company}. Chciałbym/chciałabym prosić o dodatkowe informacje dotyczące zakresu obowiązków oraz wymaganych umiejętności.\n\nZ wyrazami szacunku,\n[Twoje imię i nazwisko]`;
    
    case "team_welcome":
      return `Witajcie Zespole ${company},\n\nZ wielką radością dołączam do Was jako ${jobTitle}. Nie mogę się doczekać współpracy z Wami i wspólnego osiągania sukcesów.\n\nPozdrawiam,\n[Twoje imię i nazwisko]`;
    
    default:
      return "";
  }
}; 