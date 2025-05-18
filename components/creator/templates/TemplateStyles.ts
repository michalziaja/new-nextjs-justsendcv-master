//components/creator/templates/TemplateStyles.ts

// Interfejs danych do szablonu CV
export interface CVTemplateData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    type?: 'job' | 'project';
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: Array<{
      language: string;
      level: string;
    }>;
  };
  rodoClause: string;
}

// Definiujemy typ dla mapy sekcji
export interface SectionInfo {
  start: number;
  end: number;
  fitsOnOnePage?: boolean;
  page?: number; // Numer strony, na której znajduje się sekcja
}

// Słownik tłumaczeń do wykorzystania przez wszystkie szablony
export const translations = {
  pl: {
    profile: "Profil zawodowy",
    experience: "Doświadczenie zawodowe",
    projects: "Projekty",
    education: "Wykształcenie",
    courses: "Kursy i certyfikaty",
    skills: "Umiejętności",
    technical: "Techniczne",
    soft: "Miękkie",
    languages: "Języki obce",
    certificateNo: "Nr certyfikatu",
    email: "Email",
    phone: "Telefon",
    address: "Adres"
  },
  en: {
    profile: "Professional Profile",
    experience: "Work Experience",
    projects: "Projects",
    education: "Education",
    courses: "Courses & Certificates",
    skills: "Skills",
    technical: "Technical",
    soft: "Soft",
    languages: "Languages",
    certificateNo: "Certificate No.",
    email: "Email",
    phone: "Phone",
    address: "Address"
  }
};

// Paleta kolorów w formacie RGB do użycia w szablonach
export const colorPalette = {
  primary: 'rgb(59, 130, 246)', // blue-500
  primaryDark: 'rgb(37, 99, 235)', // blue-600
  primaryLight: 'rgb(219, 234, 254)', // blue-50
  primaryText: 'rgb(29, 78, 216)', // blue-700
  secondary: 'rgb(34, 197, 94)', // green-500
  secondaryLight: 'rgb(240, 253, 244)', // green-50
  secondaryText: 'rgb(21, 128, 61)', // green-700
  gray: 'rgb(107, 114, 128)', // gray-500
  grayLight: 'rgb(243, 244, 246)', // gray-100
  grayMedium: 'rgb(209, 213, 219)', // gray-300
  grayDark: 'rgb(75, 85, 99)', // gray-600
  text: 'rgb(17, 24, 39)', // gray-900
  textLight: 'rgb(107, 114, 128)' // gray-500
};

// Rozmiary czcionek - centralne miejsce do konfiguracji
export const fontSizes = {
  base: '11px',          // Podstawowy rozmiar dokumentu
  nameHeader: '28px',    // Imię i nazwisko
  sectionHeader: '18px', // Nagłówki sekcji
  contactInfo: '12px',   // Informacje kontaktowe
  dates: '13px',         // Daty
  position: '13px',      // Stanowisko i nagłówki umiejętności
  company: '12px',       // Nazwa firmy
  description: '11px',   // Opisy
  profileText: '12px',   // Tekst profilu
  tagText: '12px',       // Tagi umiejętności, jezyki
  rodoText: '9px'        // Klauzula RODO
};

// Marginesy i odstępy - centralne miejsce do konfiguracji
export const spacing = {
  // Marginesy dla całego dokumentu
  document: {
    paddingTop: '25px',            // Padding górny dokumentu
    paddingBottom: '10px',        // Padding dolny dokumentu
    paddingSides: '28px',         // Padding boczny dokumentu (lewy i prawy)
    borderWidth: '1px',           // Szerokość standardowego obramowania
  },
  
  // Nagłówek z danymi osobowymi
  header: {
    bottomMargin: '10px',         // Dolny margines dla nagłówka dokumentu do niebieskiej linii
    bottomSpacing: '0px',        // Odstęp po niebieskiej linii nagłówka
    contentSpacing: '5px',        // Odstęp między nazwiskiem a danymi kontaktowymi
    nameToContactSpacing: '5px', // Odstęp między imieniem/nazwiskiem a danymi kontaktowymi
    borderWidth: '2px',           // Szerokość obramowania nagłówka
  },
  
  // Sekcje zawartości (doświadczenie, edukacja, itd.)
  sections: {
    margin: '24px',               // Odstęp między sekcjami
    headerPadding: '4px',         // Padding dolny nagłówków sekcji a linia
    bottomBorder: '2px',          // Dolna krawędź sekcji
  },

  // Odstępy górne dla poszczególnych sekcji
  sectionSpacing: {
    common: '20px',
    profile: '24px',              // Odstęp nad sekcją profilu
    experience: '24px',           // Odstęp nad sekcją doświadczenia
    projects: '24px',             // Odstęp nad sekcją projektów
    education: '24px',            // Odstęp nad sekcją edukacji
    courses: '24px',              // Odstęp nad sekcją kursów
    skills: '24px',               // Odstęp nad sekcją umiejętności
  },
  
  // Elementy wewnątrz sekcji
  elements: {
    margin: '4px',                // Margines między elementami w sekcji
    itemMargin: '16px',           // Odstęp między większymi elementami (np. doświadczenia)
    contentSpacing: '8px',        // Odstęp między nagłówkiem a zawartością
    tagGap: '4px',                // Odstęp między tagami
    tagGapHorizontal: '4px',      // Poziomy odstęp między tagami
    tagPadding: '3px 8px',        // Padding wewnętrzny tagów
    skillsColumnGap: '12px',
    skillsBorderRadius: '8px',      // Odstęp między kolumnami umiejętności
    languagesItemGap: '8px',      // Odstęp między elementami językowymi
  },
  
  // Klauzula RODO
  rodo: {
    topMargin: '10px',            // Odstęp nad klauzulą RODO
    borderWidth: '1px',           // Szerokość obramowania RODO
  }
};

// Stałe wymiary i konwersje
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const MM_TO_PX = 3.779;

// Funkcja pomocnicza do formatowania daty
export const formatDate = (dateString: string, language: 'pl' | 'en' = 'pl') => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
}; 