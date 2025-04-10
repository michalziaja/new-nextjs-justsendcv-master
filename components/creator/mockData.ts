// Definicja interfejsu dla oferty pracy
export interface JobOffer {
  id: string;
  position: string;
  company: string;
  location: string;
  description: string;
  deadline?: string;
}

// Interfejs danych użytkownika
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  socials: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  }
}

// Przykładowe dane profilu użytkownika
export const mockUserProfile: UserProfile = {
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan.kowalski@example.com",
  phone: "+48 123 456 789",
  address: "Warszawa, Polska",
  socials: {
    linkedin: "linkedin.com/in/jankowalski",
    github: "github.com/jankowalski",
    twitter: "twitter.com/jankowalski",
    portfolio: "jankowalski.pl"
  }
};

// Przykładowe oferty pracy
export const mockJobOffers: JobOffer[] = [
  {
    id: "1",
    position: "Frontend Developer",
    company: "TechCorp",
    location: "Warszawa",
    description: "Poszukujemy doświadczonego Frontend Developera ze znajomością React, TypeScript i nowoczesnych technologii webowych."
  },
  {
    id: "2",
    position: "UX/UI Designer",
    company: "DesignStudio",
    location: "Kraków",
    description: "Dołącz do naszego zespołu jako UX/UI Designer. Wymagane doświadczenie w projektowaniu interfejsów dla aplikacji mobilnych i webowych."
  },
  {
    id: "3",
    position: "Full Stack Developer",
    company: "WebSolutions",
    location: "Wrocław",
    description: "Poszukujemy Full Stack Developera ze znajomością JavaScript, Node.js, React i doświadczeniem w pracy z bazami danych SQL i NoSQL."
  }
]; 