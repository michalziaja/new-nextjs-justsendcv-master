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

// Stałe wymiary i konwersje - poprawione dla lepszej synchronizacji
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const MM_TO_PX = 3.779527559; // Dokładna konwersja przy 96 DPI
export const PX_TO_MM = 0.26458333; // Odwrotna konwersja
export const BASE_FONT_SIZE_PX = 16; // Bazowy rozmiar czcionki w pikselach

// Funkcja do normalizacji jednostek CSS dla lepszej zgodności PDF
export const normalizeUnit = (value: string | number, targetUnit: 'px' | 'mm' | 'pt' = 'px'): string => {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  
  if (!value || typeof value !== 'string') {
    return '0px';
  }
  
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return '0px';
  }
  
  // Rozpoznanie jednostki
  if (value.includes('mm')) {
    if (targetUnit === 'px') return `${numericValue * MM_TO_PX}px`;
    if (targetUnit === 'mm') return value;
    if (targetUnit === 'pt') return `${numericValue * 2.834645669}pt`;
  } else if (value.includes('px')) {
    if (targetUnit === 'px') return value;
    if (targetUnit === 'mm') return `${numericValue * PX_TO_MM}mm`;
    if (targetUnit === 'pt') return `${numericValue * 0.75}pt`;
  } else if (value.includes('rem')) {
    const pxValue = numericValue * BASE_FONT_SIZE_PX;
    if (targetUnit === 'px') return `${pxValue}px`;
    if (targetUnit === 'mm') return `${pxValue * PX_TO_MM}mm`;
    if (targetUnit === 'pt') return `${pxValue * 0.75}pt`;
  } else if (value.includes('em')) {
    const pxValue = numericValue * BASE_FONT_SIZE_PX;
    if (targetUnit === 'px') return `${pxValue}px`;
    if (targetUnit === 'mm') return `${pxValue * PX_TO_MM}mm`;
    if (targetUnit === 'pt') return `${pxValue * 0.75}pt`;
  } else if (value.includes('pt')) {
    if (targetUnit === 'px') return `${numericValue * 1.333333}px`;
    if (targetUnit === 'mm') return `${numericValue * 0.352777778}mm`;
    if (targetUnit === 'pt') return value;
  }
  
  // Jeśli nie rozpoznano jednostki, zakładamy px
  return `${numericValue}px`;
};

// Funkcja do optymalizacji stylów dla PDF
export const optimizeStylesForPDF = (styles: Record<string, any>): Record<string, any> => {
  const optimizedStyles: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'string') {
      // Normalizacja jednostek dla marginesów i paddingów
      if (key.includes('margin') || key.includes('padding') || key.includes('width') || key.includes('height')) {
        optimizedStyles[key] = normalizeUnit(value, 'px');
      }
      // Normalizacja fontSizes
      else if (key.includes('fontSize') || key === 'fontSize') {
        optimizedStyles[key] = normalizeUnit(value, 'px');
      }
      // Pozostałe wartości bez zmian
      else {
        optimizedStyles[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      // Rekurencyjne przetwarzanie zagnieżdżonych obiektów
      optimizedStyles[key] = optimizeStylesForPDF(value);
    } else {
      optimizedStyles[key] = value;
    }
  }
  
  return optimizedStyles;
};

// Rozmiary czcionek - z normalizacją jednostek dla lepszej zgodności
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

// Marginesy i odstępy - z normalizacją jednostek
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
    tagGap: '8px',                // Odstęp między tagami
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