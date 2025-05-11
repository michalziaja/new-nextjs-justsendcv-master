//components/creator/templates/CVTemplate.tsx

import React, { useRef, useEffect } from 'react';
import { useCV } from '../CVContext';
import { 
  CVTemplateProps,
  SectionRefs,
  translations,
  colorPalette,
  defaultFontSizes,
  defaultSpacing,
  deepMerge,
  useHasContent,
  useSectionsLayout,
  formatDate,
  getVisibleSections
} from './CVTemplateLogic';
import { 
  FaLinkedin, 
  FaGithub, 
  FaGlobe, 
  FaTwitter, 
  FaFacebook, 
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

// Komponent renderujący nowoczesny szablon CV
export const ModernCVTemplate: React.FC<CVTemplateProps> = ({ 
  data, 
  selectedJob, 
  language, 
  pageIndex = 0, 
  totalPages = 1, 
  isPrintVersion = false,
  isMeasurement = false,
  sectionsMap = {},
  onSectionsUpdate,
  activeSection = 'summary', // Domyślnie ustawiamy "summary", aby pokazać wszystkie sekcje
  showProjectsInPreview = false
}) => {
  const t = translations[language];
  const isLastPage = pageIndex === totalPages - 1;
  const { cvData } = useCV();

  // Pobierz listę sekcji, które powinny być widoczne
  const visibleSections = isMeasurement ? 
    ['header', 'profile', 'experience', 'projects', 'education', 'courses', 'skills', 'rodo'] : // Podczas pomiaru pokazujemy wszystkie
    getVisibleSections(activeSection, isPrintVersion || (activeSection !== 'experience' || showProjectsInPreview));

  // Obliczanie podstawowych rozmiarów czcionek
  const baseFontSizes = {
    ...defaultFontSizes,
    ...Object.entries(cvData.customStyles?.fontSizes || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof typeof defaultFontSizes] = value;
      }
      return acc;
    }, {} as Partial<typeof defaultFontSizes>)
  };
  
  // Używamy bezpośrednio baseFontSizes, nie skalujemy
  const effectiveFontSizes = baseFontSizes;

  // Dla spacing (zagnieżdżone) - używamy deepMerge
  const effectiveSpacing = deepMerge(defaultSpacing, cvData.customStyles?.spacing || {});

  // Referencje dla każdego elementu w sekcjach - używamy tablic referencji React
  const experienceItemsRef = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  const projectItemsRef = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  const educationItemsRef = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  const coursesItemsRef = useRef<React.RefObject<HTMLDivElement | null>[]>([]);

  // Inicjalizacja tablic referencji przy każdej zmianie danych
  useEffect(() => {
    const experienceItems = data.experience.filter(exp => !exp.type || exp.type === 'job');
    const projectItems = data.experience.filter(exp => exp.type === 'project');

    // Tworzymy nowe tablice referencji o odpowiednich rozmiarach
    const newExperienceRefs: React.RefObject<HTMLDivElement | null>[] = [];
    const newProjectRefs: React.RefObject<HTMLDivElement | null>[] = [];
    const newEducationRefs: React.RefObject<HTMLDivElement | null>[] = [];
    const newCoursesRefs: React.RefObject<HTMLDivElement | null>[] = [];

    // Inicjalizujemy referencje dla doświadczenia
    for (let i = 0; i < experienceItems.length; i++) {
      if (i < experienceItemsRef.current.length) {
        newExperienceRefs.push(experienceItemsRef.current[i]);
      } else {
        newExperienceRefs.push(React.createRef<HTMLDivElement | null>());
      }
    }

    // Inicjalizujemy referencje dla projektów
    for (let i = 0; i < projectItems.length; i++) {
      if (i < projectItemsRef.current.length) {
        newProjectRefs.push(projectItemsRef.current[i]);
      } else {
        newProjectRefs.push(React.createRef<HTMLDivElement | null>());
      }
    }

    // Inicjalizujemy referencje dla edukacji
    for (let i = 0; i < data.education.length; i++) {
      if (i < educationItemsRef.current.length) {
        newEducationRefs.push(educationItemsRef.current[i]);
      } else {
        newEducationRefs.push(React.createRef<HTMLDivElement | null>());
      }
    }

    // Inicjalizujemy referencje dla kursów
    const coursesLength = data.courses?.length || 0;
    for (let i = 0; i < coursesLength; i++) {
      if (i < coursesItemsRef.current.length) {
        newCoursesRefs.push(coursesItemsRef.current[i]);
      } else {
        newCoursesRefs.push(React.createRef<HTMLDivElement | null>());
      }
    }

    // Aktualizujemy referencje
    experienceItemsRef.current = newExperienceRefs;
    projectItemsRef.current = newProjectRefs;
    educationItemsRef.current = newEducationRefs;
    coursesItemsRef.current = newCoursesRefs;
  }, [data.experience, data.education, data.courses]);

  // Referencje do sekcji
  const sectionRefs: SectionRefs = {
    header: useRef<HTMLDivElement | null>(null),
    profile: useRef<HTMLDivElement | null>(null),
    experience: useRef<HTMLDivElement | null>(null),
    projects: useRef<HTMLDivElement | null>(null),
    education: useRef<HTMLDivElement | null>(null),
    courses: useRef<HTMLDivElement | null>(null),
    skills: useRef<HTMLDivElement | null>(null),
    rodo: useRef<HTMLDivElement | null>(null),
    // Używamy zainicjalizowanych tablic referencji
    experienceItems: experienceItemsRef.current,
    projectItems: projectItemsRef.current,
    educationItems: educationItemsRef.current,
    coursesItems: coursesItemsRef.current
  };

  // Sprawdzanie zawartości sekcji
  const hasContent = useHasContent(data);

  // Obliczanie layoutu sekcji
  useSectionsLayout(sectionRefs, hasContent, isMeasurement, onSectionsUpdate, effectiveSpacing);

  // Funkcja pomocnicza zwracająca ikonę dla danego typu linku
  const getSocialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin style={{ fontSize: '16px' }} />;
      case 'github':
        return <FaGithub style={{ fontSize: '16px' }} />;
      case 'portfolio':
      case 'website':
        return <FaGlobe style={{ fontSize: '16px' }} />;
      case 'twitter':
        return <FaTwitter style={{ fontSize: '16px' }} />;
      case 'facebook':
        return <FaFacebook style={{ fontSize: '16px' }} />;
      case 'instagram':
        return <FaInstagram style={{ fontSize: '16px' }} />;
      default:
        return <FaGlobe style={{ fontSize: '16px' }} />;
    }
  };

  // Funkcja renderująca sekcję z obsługą podziału sekcji na strony
  const renderSection = (key: string, content: React.ReactNode, index?: number) => {
    // Sprawdź czy sekcja powinna być widoczna na podstawie aktualnego kroku
    const sectionBase = key.split('-')[0] as string;
    if (!isMeasurement && !visibleSections.includes(sectionBase)) {
      return null; // Nie renderuj sekcji, jeśli nie jest widoczna
    }
    
    if (!isMeasurement) {
      if (key !== 'header') {
        const sectionKey = key.split('-')[0] as keyof typeof hasContent;
        if (hasContent[sectionKey] === false) {
          return null;
        }
      }
    }
    
    // Tryb pomiaru - renderujemy wszystkie sekcje bez sprawdzania strony
    if (isMeasurement) {
      // Sprawdź, czy to element podziałowej sekcji (np. experience-0, education-1)
      if (key.includes('-') && !key.startsWith('header-')) {
        const [baseSection, idx] = key.split('-');
        // Używamy odpowiedniej referencji z tablic elementów
        const elemIdx = parseInt(idx);
        let elemRef = null;
        
        if (baseSection === 'experience' && sectionRefs.experienceItems && elemIdx < sectionRefs.experienceItems.length) {
          elemRef = sectionRefs.experienceItems[elemIdx];
        } else if (baseSection === 'projects' && sectionRefs.projectItems && elemIdx < sectionRefs.projectItems.length) {
          elemRef = sectionRefs.projectItems[elemIdx];
        } else if (baseSection === 'education' && sectionRefs.educationItems && elemIdx < sectionRefs.educationItems.length) {
          elemRef = sectionRefs.educationItems[elemIdx];
        } else if (baseSection === 'course' && sectionRefs.coursesItems && elemIdx < sectionRefs.coursesItems.length) {
          elemRef = sectionRefs.coursesItems[elemIdx];
        }
        
        return (
          <div
            key={`${key}-${index ?? ''}`}
            ref={elemRef}
            style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              position: 'relative',
              marginTop: elemIdx > 0 ? effectiveSpacing.elements.itemMargin : effectiveSpacing.elements.contentSpacing
            }}
          >
            {content}
          </div>
        );
      }
      
      // Podstawowe sekcje (header, profile, itp.)
      return (
        <div
          key={`${key}-${index ?? ''}`}
          ref={key in sectionRefs ? 
            // Sprawdzamy czy jest to pojedyncza referencja czy tablica
            Array.isArray(sectionRefs[key as keyof typeof sectionRefs]) ? 
              undefined : // Jeśli to tablica, nie używamy referencji
              sectionRefs[key as keyof typeof sectionRefs] as React.RefObject<HTMLDivElement> : 
            undefined
          }
          style={{
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            position: 'relative',
            marginTop: key !== 'header' ? effectiveSpacing.sections.margin : undefined
          }}
        >
          {content}
        </div>
      );
    }
    
    // Dla RODO - tylko na ostatniej stronie
    if (key === 'rodo') {
      if (isLastPage) {
        return (
          <div
            key={`${key}-${index ?? ''}`}
            style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              position: 'relative',
              marginTop: effectiveSpacing.rodo.topMargin
            }}
          >
            {content}
          </div>
        );
      }
      return null;
    }
    
    // Dla nagłówka - tylko na pierwszej stronie
    if (key === 'header') {
      if (pageIndex === 0) {
        return (
          <div
            key={`${key}-${index ?? ''}`}
            style={{
              display: 'flex', 
              alignItems: 'flex-start',
              borderBottom: `${effectiveSpacing.header.borderWidth} solid ${colorPalette.primary}`,
              paddingBottom: effectiveSpacing.header.bottomMargin,
              marginBottom: effectiveSpacing.header.bottomSpacing
            }}
          >
            {/* Zdjęcie profilowe - jeśli włączone i dostępne */}
            {(String(data.personalData.includePhotoInCV).toLowerCase() === 'true') && data.personalData.photoUrl && (
              <div style={{
                marginRight: '20px', 
                width: `${data.personalData.photoScalePercent || 100}px`, // Używamy skali jako wartości w px
                height: `${data.personalData.photoScalePercent || 100}px`, // Używamy skali jako wartości w px
                overflow: 'hidden',
                borderRadius: data.personalData.photoBorderRadius || '0px', // Stosujemy wybrane zaokrąglenie
                flexShrink: 0 
              }}>
                <img 
                  src={data.personalData.photoUrl} 
                  alt="Zdjęcie profilowe" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            
            {/* Kontener na dane tekstowe */}
            <div style={{ flex: 1 }}> 
              <h1 style={{ fontSize: effectiveFontSizes.nameHeader, fontWeight: 700 }}>{data.personalData.firstName} {data.personalData.lastName}</h1>
              
              {/* Sprawdzamy czy są jakieś linki społecznościowe do wyświetlenia */}
              {data.personalData.socialLinks && 
               data.personalData.socialLinks.filter(link => link.include).length > 0 ? (
                // Jeśli są linki - układ dwukolumnowy
                <div style={{ 
                  marginTop: effectiveSpacing.elements.contentSpacing,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: effectiveSpacing.elements.margin,
                  color: colorPalette.grayDark,
                  fontSize: effectiveFontSizes.contactInfo
                }}>
                  {/* Lewa kolumna - dane kontaktowe */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaEnvelope style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaPhone style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaMapMarkerAlt style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.address}
                    </div>
                  </div>
                  
                  {/* Prawa kolumna - linki społecznościowe */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {data.personalData.socialLinks
                      .filter(link => link.include)
                      .map((link, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          color: colorPalette.primary
                        }}>
                          {getSocialIcon(link.type)}
                          <span>{link.url}</span>
                        </div>
                      ))}
                  </div>
                </div>
               ) : (
                // Jeśli nie ma linków - dane kontaktowe w jednym rzędzie
                <div style={{ 
                  marginTop: effectiveSpacing.elements.contentSpacing,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: colorPalette.grayDark,
                  fontSize: effectiveFontSizes.contactInfo
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaEnvelope style={{ fontSize: '14px', color: colorPalette.primary }} />
                    {data.personalData.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaPhone style={{ fontSize: '14px', color: colorPalette.primary }} />
                    {data.personalData.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaMapMarkerAlt style={{ fontSize: '14px', color: colorPalette.primary }} />
                    {data.personalData.address}
                  </div>
                </div>
               )}
              
              {selectedJob && (
                <div style={{ marginTop: effectiveSpacing.elements.contentSpacing, color: colorPalette.primary, fontWeight: 400, fontSize: effectiveFontSizes.contactInfo }}>
                  {language === 'pl' ? 'Aplikacja na stanowisko:' : 'Application for position:'} {selectedJob.title} {language === 'pl' ? 'w' : 'at'} {selectedJob.company}
                </div>
              )}
            </div>
          </div>
        );
      }
      return null;
    }
    
    // Sprawdzenie czy to pojedynczy element sekcji (np. experience-0, education-1)
    if (key.includes('-') && !key.startsWith('header-')) {
      const [baseSection, idx] = key.split('-');
      const elemIdx = parseInt(idx);
      
      // Sprawdź czy mamy informacje o mapie sekcji
      if (Object.keys(sectionsMap).length > 0) {
        // Znajdź sekcję bazową
        const baseSectionInfo = sectionsMap[baseSection];
        
        if (baseSectionInfo && baseSectionInfo.childElements) {
          // Sprawdź czy ten element należy do bieżącej strony
          const elementKey = `${baseSection}-${idx}`;
          const elementInfo = baseSectionInfo.childElements[elementKey];
          
          if (elementInfo && elementInfo.page !== undefined) {
            // Jeśli element ma przypisaną stronę, sprawdź czy to ta strona
            if (pageIndex !== (elementInfo.page - 1)) {
              return null; // Element należy do innej strony
            }
          } else {
            // Fallback - sprawdź, czy sekcja jest przypisana do tej strony
            if (baseSectionInfo.page !== undefined && pageIndex !== (baseSectionInfo.page - 1)) {
              return null;
            }
          }
        }
      }
      
      // Określ, czy element jest kontynuacją z poprzedniej strony
      let isContinuation = false;
      let marginTop = elemIdx > 0 ? effectiveSpacing.elements.itemMargin : effectiveSpacing.elements.contentSpacing;
      
      // Sprawdź czy sekcja jest podzielona i czy to element z początku strony
      if (sectionsMap[baseSection] && 
          sectionsMap[baseSection].isSplit && 
          sectionsMap[baseSection].elementsBoundaries) {
        
        const boundaries = sectionsMap[baseSection].elementsBoundaries;
        
        // Sprawdź, czy to pierwszy element na tej stronie
        if (boundaries[pageIndex + 1] && 
            boundaries[pageIndex + 1].firstElement === elemIdx &&
            pageIndex > 0) {
          // To jest pierwszy element na tej stronie, ale nie pierwszej
          isContinuation = true;
          marginTop = effectiveSpacing.elements.contentSpacing; // Reset marginesu
        }
      }
      
      // Renderuj element z odpowiednim stylem
      return (
        <div
          key={`${key}-${index ?? ''}`}
          style={{
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            position: 'relative',
            marginTop
          }}
        >
          {/* Dodaj informację o kontynuacji jeśli potrzebna */}
          {isContinuation && (
            <div style={{ 
              fontSize: effectiveFontSizes.base,
              color: colorPalette.grayDark,
              fontStyle: 'italic',
              marginBottom: '8px'
            }}>
              {language === 'pl' ? '(kontynuacja)' : '(continued)'}
            </div>
          )}
          {content}
        </div>
      );
    }
    
    // Dla zwykłych sekcji (profile, experience, education, itp.)
    // Nowy sposób sprawdzania, na której stronie powinna znaleźć się sekcja
    if (Object.keys(sectionsMap).length > 0 && sectionsMap[key]) {
      // Jeśli mamy informacje o stronie w mapie sekcji, używamy jej
      const sectionInfo = sectionsMap[key];
      
      if (sectionInfo.page !== undefined) {
        // Sprawdzamy czy bieżący indeks strony odpowiada przypisanej stronie sekcji
        if (pageIndex !== (sectionInfo.page - 1)) {
          return null; // Sekcja nie należy do bieżącej strony
        }
        
        // Sprawdź, czy nagłówek sekcji powinien być renderowany na tej stronie
        if (sectionInfo.isSplit && pageIndex > 0) {
          // Dla podzielonych sekcji na następnych stronach dodajemy informację o kontynuacji
          // Znajdujemy elementy, które należą do bieżącej strony
          if (sectionInfo.elementsBoundaries && sectionInfo.elementsBoundaries[pageIndex + 1]) {
            const { firstElement, lastElement } = sectionInfo.elementsBoundaries[pageIndex + 1];
            
            // Renderujemy tylko elementy, nie nagłówek sekcji
            return (
              <div
                key={`${key}-cont-${pageIndex}`}
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  position: 'relative',
                  marginTop: effectiveSpacing.sections.margin
                }}
              >
                {/* Nagłówek kontynuacji */}
                <h2 style={{ 
                  paddingBottom: effectiveSpacing.sections.headerPadding,
                  borderBottom: `${effectiveSpacing.sections.bottomBorder} solid ${colorPalette.grayMedium}`, 
                  fontSize: effectiveFontSizes.sectionHeader,
                  fontWeight: 700
                }}>
                  {t[key as keyof typeof t]} {language === 'pl' ? '(kontynuacja)' : '(continued)'}
                </h2>
                
                {/* Zawartość będzie renderowana jako osobne elementy */}
              </div>
            );
          }
          return null;
        }
      } else {
        // Stara metoda jako fallback - sprawdzamy na podstawie początku sekcji
        const pageHeight = 297 * 3.779; // A4_HEIGHT_MM * MM_TO_PX
        const startPage = Math.floor(sectionInfo.start / pageHeight);
        
        if (pageIndex !== startPage) {
          return null;
        }
      }
    } 
    else if (Object.keys(sectionsMap).length === 0 && pageIndex !== 0) {
      return null;
    }
    
    return (
      <div
        key={`${key}-${index ?? ''}`}
        style={{
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          position: 'relative',
          marginTop: key !== 'header' && !key.includes('-') ? effectiveSpacing.sections.margin : 
                    key.includes('-') ? effectiveSpacing.elements.itemMargin : undefined
        }}
      >
        {content}
      </div>
    );
  };

  // Funkcja renderująca nagłówek sekcji
  const renderSectionHeader = (title: string, sectionType: keyof typeof effectiveSpacing.sectionSpacing) => (
    <h2 style={{ 
      paddingBottom: effectiveSpacing.sections.headerPadding,
      borderBottom: `${effectiveSpacing.sections.bottomBorder} solid ${colorPalette.grayMedium}`, 
      fontSize: effectiveFontSizes.sectionHeader,
      fontWeight: 700,
      marginTop: effectiveSpacing.sectionSpacing[sectionType]
    }}>{title}</h2>
  );

  // Style dla kontenera głównego
  const containerStyle = {
    paddingTop: pageIndex === 0 ? effectiveSpacing.document.paddingTop : '0px', // Górny margines tylko dla pierwszej strony
    paddingBottom: effectiveSpacing.document.paddingBottom,
    paddingLeft: effectiveSpacing.document.paddingSides,
    paddingRight: effectiveSpacing.document.paddingSides,
    fontFamily: '"Roboto", sans-serif', 
    lineHeight: '1.5',
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column' as const, 
    fontSize: effectiveFontSizes.base,
    position: 'relative' as const,
    minHeight: '297mm',
    margin: '0',
    overflow: isMeasurement ? 'visible' : 'hidden'
  };

  // Style dla głównej treści CV
  const mainContentStyle = {
    flexGrow: 1,
    paddingBottom: isLastPage ? '60px' : 0,
    position: 'relative' as const,
    height: isPrintVersion ? '100%' : 'auto',
    margin: '0'
  };

  // Przygotowanie sekcji doświadczenia
  const experienceItems = data.experience
    .filter(exp => !exp.type || exp.type === 'job')
    .map((exp, index) => renderSection(`experience-${index}`, (
      <div key={index} style={{ marginTop: index === 0 ? effectiveSpacing.elements.contentSpacing : effectiveSpacing.elements.itemMargin }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: effectiveFontSizes.position }}>{exp.position}</div>
          <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.dates }}>
            {exp.startDate && formatDate(exp.startDate, language)} - {exp.endDate && formatDate(exp.endDate, language)}
          </div>
        </div>
        <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.company }}>{exp.company}</div>
        <div style={{ marginTop: effectiveSpacing.elements.margin, fontSize: effectiveFontSizes.description, whiteSpace: 'pre-wrap' }}>{exp.description}</div>
      </div>
    ), index));

  // Przygotowanie sekcji projektów
  const projectItems = data.experience
    .filter(exp => exp.type === 'project')
    .map((exp, index) => renderSection(`projects-${index}`, (
      <div key={index} style={{ marginTop: index === 0 ? effectiveSpacing.elements.contentSpacing : effectiveSpacing.elements.itemMargin }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 400, fontSize: effectiveFontSizes.position }}>{exp.position}</div>
          <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.dates }}>
            {exp.startDate && formatDate(exp.startDate, language)} - {exp.endDate && formatDate(exp.endDate, language)}
          </div>
        </div>
        <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.company }}>{exp.company}</div>
        <div style={{ marginTop: effectiveSpacing.elements.margin, fontSize: effectiveFontSizes.description, whiteSpace: 'pre-wrap' }}>{exp.description}</div>
      </div>
    ), index));

  // Przygotowanie sekcji edukacji
  const educationItems = data.education.map((edu, index) => renderSection(`education-${index}`, (
    <div key={index} style={{ marginTop: index === 0 ? effectiveSpacing.elements.contentSpacing : effectiveSpacing.elements.itemMargin }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 400, fontSize: effectiveFontSizes.position }}>{edu.school}</div>
        <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.dates }}>
          {edu.startDate && formatDate(edu.startDate, language)} - {edu.endDate && formatDate(edu.endDate, language)}
        </div>
      </div>
      <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.company }}>{edu.degree}</div>
      <div style={{ marginTop: effectiveSpacing.elements.margin, fontSize: effectiveFontSizes.description, whiteSpace: 'pre-wrap' }}>{edu.description}</div>
    </div>
  ), index));

  // Przygotowanie sekcji kursów
  const coursesItems = data.courses && data.courses.length > 0 
    ? data.courses.map((course, index) => (
        <div key={index} style={{ marginTop: index === 0 ? effectiveSpacing.elements.contentSpacing : effectiveSpacing.elements.itemMargin }}>
          {/* Pierwszy wiersz: Nazwa kursu i data */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 400, fontSize: effectiveFontSizes.position }}>{course.name}</div>
            <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.dates }}>
              {course.date && formatDate(course.date, language)}
            </div>
          </div>
          
          {/* Drugi wiersz: Organizator i numer certyfikatu */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.company }}>{course.organizer}</div>
            {course.certificateNumber && (
              <div style={{ color: colorPalette.grayDark, fontSize: effectiveFontSizes.description }}>
                {t.certificateNo}: {course.certificateNumber}
              </div>
            )}
          </div>
          
          {/* Trzeci wiersz: Opis */}
          {course.description && (
            <div style={{ marginTop: effectiveSpacing.elements.margin, fontSize: effectiveFontSizes.description, whiteSpace: 'pre-wrap' }}>
              {course.description}
            </div>
          )}
        </div>
      ))
    : [];

  if (isMeasurement) {
    return (
      <div style={containerStyle}>
        <div style={mainContentStyle}>
          {/* Nagłówek z danymi osobowymi */}
          {renderSection('header', (
            <div style={{ // Główny kontener dla całego nagłówka (zdjęcie + tekst)
              display: 'flex', 
              alignItems: 'flex-start',
              borderBottom: `${effectiveSpacing.header.borderWidth} solid ${colorPalette.primary}`,
              paddingBottom: effectiveSpacing.header.bottomMargin,
              marginBottom: effectiveSpacing.header.bottomSpacing
            }}>
              {/* Zdjęcie profilowe - jeśli włączone i dostępne */}
              {(String(data.personalData.includePhotoInCV).toLowerCase() === 'true') && data.personalData.photoUrl && (
                <div style={{
                  marginRight: '20px', 
                  width: `${data.personalData.photoScalePercent || 100}px`, // Używamy skali jako wartości w px
                  height: `${data.personalData.photoScalePercent || 100}px`, // Używamy skali jako wartości w px
                  overflow: 'hidden',
                  borderRadius: data.personalData.photoBorderRadius || '0px', // Stosujemy wybrane zaokrąglenie
                  flexShrink: 0 
                }}>
                  <img 
                    src={data.personalData.photoUrl} 
                    alt="Zdjęcie profilowe" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              
              {/* Kontener na dane tekstowe */}
              <div style={{ flex: 1 }}> 
                <h1 style={{ fontSize: effectiveFontSizes.nameHeader, fontWeight: 700 }}>{data.personalData.firstName} {data.personalData.lastName}</h1>
                
                {/* Sprawdzamy czy są jakieś linki społecznościowe do wyświetlenia */}
                {data.personalData.socialLinks && 
                 data.personalData.socialLinks.filter(link => link.include).length > 0 ? (
                  // Jeśli są linki - układ dwukolumnowy
                  <div style={{ 
                    marginTop: effectiveSpacing.elements.contentSpacing,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: effectiveSpacing.elements.margin,
                    color: colorPalette.grayDark,
                    fontSize: effectiveFontSizes.contactInfo
                  }}>
                    {/* Lewa kolumna - dane kontaktowe */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaEnvelope style={{ fontSize: '14px', color: colorPalette.primary }} />
                        {data.personalData.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaPhone style={{ fontSize: '14px', color: colorPalette.primary }} />
                        {data.personalData.phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaMapMarkerAlt style={{ fontSize: '14px', color: colorPalette.primary }} />
                        {data.personalData.address}
                      </div>
                    </div>
                    
                    {/* Prawa kolumna - linki społecznościowe */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {data.personalData.socialLinks
                        .filter(link => link.include)
                        .map((link, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            color: colorPalette.primary
                          }}>
                            {getSocialIcon(link.type)}
                            <span>{link.url}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                 ) : (
                  // Jeśli nie ma linków - dane kontaktowe w jednym rzędzie
                  <div style={{ 
                    marginTop: effectiveSpacing.elements.contentSpacing,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: colorPalette.grayDark,
                    fontSize: effectiveFontSizes.contactInfo
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaEnvelope style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaPhone style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaMapMarkerAlt style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.address}
                    </div>
                  </div>
                 )}
                
                {selectedJob && (
                  <div style={{ marginTop: effectiveSpacing.elements.contentSpacing, color: colorPalette.primary, fontWeight: 400, fontSize: effectiveFontSizes.contactInfo }}>
                    {language === 'pl' ? 'Aplikacja na stanowisko:' : 'Application for position:'} {selectedJob.title} {language === 'pl' ? 'w' : 'at'} {selectedJob.company}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Opis profilu - zawsze na początku */}
          {hasContent.profile && renderSection('profile', (
            <div>
              {renderSectionHeader(t.profile, 'profile')}
              <p style={{ 
                marginTop: effectiveSpacing.elements.contentSpacing,
                color: colorPalette.grayDark, 
                // fontSize: effectiveFontSizes.profileText
                fontSize: effectiveFontSizes.description
              }}>{data.description}</p>
            </div>
          ))}
        
          {/* Doświadczenie */}
          {hasContent.experience && experienceItems.length > 0 && renderSection('experience', (
            <div>
              {renderSectionHeader(t.experience, 'experience')}
              {experienceItems}
            </div>
          ))}
          
          {/* Projekty */}
          {hasContent.projects && projectItems.length > 0 && renderSection('projects', (
            <div>
              {renderSectionHeader(t.projects, 'projects')}
              {projectItems}
            </div>
          ))}
          
          {/* Wykształcenie */}
          {hasContent.education && renderSection('education', (
            <div>
              {renderSectionHeader(t.education, 'education')}
              {educationItems}
            </div>
          ))}
          
          {/* Kursy i certyfikaty */}
          {hasContent.courses && renderSection('courses', (
            <div>
              {renderSectionHeader(t.courses, 'courses')}
              {coursesItems}
            </div>
          ))}
          
          {/* Umiejętności */}
          {hasContent.skills && renderSection('skills', (
            <div>
              {renderSectionHeader(t.skills, 'skills')}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
                gap: effectiveSpacing.elements.skillsColumnGap,
                marginTop: effectiveSpacing.elements.contentSpacing
              }}>
                <div>
                  <h3 style={{ color: colorPalette.text, fontWeight: 400, fontSize: effectiveFontSizes.subSectionHeader }}>{t.technical}</h3>
                  <div style={{ 
                    marginTop: effectiveSpacing.elements.margin,
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: effectiveSpacing.elements.tagGap
                  }}>
                    {data.skills.technical.map((skill, index) => (
                      <span key={index} style={{ 
                        backgroundColor: colorPalette.primaryLight, 
                        color: colorPalette.primaryText, 
                        padding: effectiveSpacing.elements.tagPadding,
                        borderRadius: effectiveSpacing.elements.skillsBorderRadius,
                        fontSize: effectiveFontSizes.tagText
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ color: colorPalette.text, fontWeight: 400, fontSize: effectiveFontSizes.subSectionHeader }}>{t.soft}</h3>
                  <div style={{ 
                    marginTop: effectiveSpacing.elements.margin,
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: effectiveSpacing.elements.tagGap
                  }}>
                    {data.skills.soft.map((skill, index) => (
                      <span key={index} style={{ 
                        backgroundColor: colorPalette.secondaryLight, 
                        color: colorPalette.secondaryText, 
                        padding: effectiveSpacing.elements.tagPadding,
                        borderRadius: effectiveSpacing.elements.skillsBorderRadius,
                        fontSize: effectiveFontSizes.tagText
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: effectiveSpacing.elements.itemMargin }}>
                <h3 style={{ color: colorPalette.text, fontWeight: 400, fontSize: effectiveFontSizes.subSectionHeader }}>{t.languages}</h3>
                <div style={{ 
                  marginTop: effectiveSpacing.elements.margin,
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: effectiveSpacing.elements.languagesItemGap
                }}>
                  {data.skills.languages.filter(lang => lang.language && lang.level).map((lang, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: effectiveSpacing.elements.margin,
                      fontSize: effectiveFontSizes.tagText
                    }}>
                      <span style={{ fontWeight: 400 }}>{lang.language}:</span>
                      <span style={{ backgroundColor: colorPalette.grayLight, padding: '0 4px', borderRadius: '4px' }}>{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Klauzula RODO */}
        {data.rodoClause && hasContent.rodo && isLastPage && data.showRodoClause !== false && (
          <div 
            ref={sectionRefs.rodo}
            style={{ 
              fontSize: effectiveFontSizes.rodoText, 
              color: colorPalette.textLight, 
              lineHeight: '1.2',
              paddingLeft: effectiveSpacing.document.paddingSides,
              paddingRight: effectiveSpacing.document.paddingSides,
              visibility: 'hidden', 
              position: 'absolute',
              bottom: '-9999px',
            }}
          >
            {data.rodoClause}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={mainContentStyle}>
        {/* Nagłówek z danymi osobowymi */}
        {renderSection('header', (
          <div style={{ // Główny kontener dla całego nagłówka (zdjęcie + tekst)
            display: 'flex',
            alignItems: 'flex-start',
            borderBottom: `${effectiveSpacing.header.borderWidth} solid ${colorPalette.primary}`,
            paddingBottom: effectiveSpacing.header.bottomMargin,
            marginBottom: effectiveSpacing.header.bottomSpacing
          }}>
            {/* Zdjęcie profilowe - jeśli włączone i dostępne */}
            {(String(data.personalData.includePhotoInCV).toLowerCase() === 'true') && data.personalData.photoUrl && (
              <div style={{
                marginRight: '20px',
                width: `${data.personalData.photoScalePercent || 100}px`, // Używamy skali jako wartości w px
                height: `${data.personalData.photoScalePercent || 100}px`, // Używamy skali jako wartości w px
                overflow: 'hidden',
                borderRadius: data.personalData.photoBorderRadius || '0px', // Stosujemy wybrane zaokrąglenie
                flexShrink: 0 
              }}>
                <img 
                  src={data.personalData.photoUrl} 
                  alt="Zdjęcie profilowe" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Kontener na dane tekstowe */}
            <div style={{ flex: 1 }}> 
              <h1 style={{ fontSize: effectiveFontSizes.nameHeader, fontWeight: 700 }}>{data.personalData.firstName} {data.personalData.lastName}</h1>
          
              {/* Sprawdzamy czy są jakieś linki społecznościowe do wyświetlenia */}
              {data.personalData.socialLinks && 
               data.personalData.socialLinks.filter(link => link.include).length > 0 ? (
                // Jeśli są linki - układ dwukolumnowy
                <div style={{ 
                  marginTop: effectiveSpacing.elements.contentSpacing,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: effectiveSpacing.elements.margin,
                  color: colorPalette.grayDark,
                  fontSize: effectiveFontSizes.contactInfo
                }}>
                  {/* Lewa kolumna - dane kontaktowe */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaEnvelope style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaPhone style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaMapMarkerAlt style={{ fontSize: '14px', color: colorPalette.primary }} />
                      {data.personalData.address}
                    </div>
                  </div>
                  
                  {/* Prawa kolumna - linki społecznościowe */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {data.personalData.socialLinks
                      .filter(link => link.include)
                      .map((link, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          color: colorPalette.primary
                        }}>
                          {getSocialIcon(link.type)}
                          <span>{link.url}</span>
                        </div>
                      ))}
                  </div>
                </div>
               ) : (
                // Jeśli nie ma linków - dane kontaktowe w jednym rzędzie
                <div style={{ 
                  marginTop: effectiveSpacing.elements.contentSpacing,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: colorPalette.grayDark,
                  fontSize: effectiveFontSizes.contactInfo
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaEnvelope style={{ fontSize: '14px', color: colorPalette.primary }} />
                    {data.personalData.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaPhone style={{ fontSize: '14px', color: colorPalette.primary }} />
                    {data.personalData.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaMapMarkerAlt style={{ fontSize: '14px', color: colorPalette.primary }} />
                    {data.personalData.address}
                  </div>
                </div>
               )}
              
              {selectedJob && (
                <div style={{ marginTop: effectiveSpacing.elements.contentSpacing, color: colorPalette.primary, fontWeight: 400, fontSize: effectiveFontSizes.contactInfo }}>
                  {language === 'pl' ? 'Aplikacja na stanowisko:' : 'Application for position:'} {selectedJob.title} {language === 'pl' ? 'w' : 'at'} {selectedJob.company}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Opis profilu - zawsze na początku */}
        {hasContent.profile && renderSection('profile', (
          <div>
            {renderSectionHeader(t.profile, 'profile')}
            <p style={{ 
              marginTop: effectiveSpacing.elements.contentSpacing,
              color: colorPalette.grayDark, 
              // fontSize: effectiveFontSizes.profileText
              fontSize: effectiveFontSizes.description
            }}>{data.description}</p>
          </div>
        ))}
      
        {/* Doświadczenie */}
        {hasContent.experience && experienceItems.length > 0 && renderSection('experience', (
          <div>
            {renderSectionHeader(t.experience, 'experience')}
            {experienceItems}
          </div>
        ))}
        
        {/* Projekty */}
        {hasContent.projects && projectItems.length > 0 && renderSection('projects', (
          <div>
            {renderSectionHeader(t.projects, 'projects')}
            {projectItems}
          </div>
        ))}
        
        {/* Wykształcenie */}
        {hasContent.education && renderSection('education', (
          <div>
            {renderSectionHeader(t.education, 'education')}
            {educationItems}
          </div>
        ))}
        
        {/* Kursy i certyfikaty */}
        {hasContent.courses && renderSection('courses', (
          <div>
            {renderSectionHeader(t.courses, 'courses')}
            {coursesItems}
          </div>
        ))}
        
        {/* Umiejętności */}
        {hasContent.skills && renderSection('skills', (
          <div>
            {renderSectionHeader(t.skills, 'skills')}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
              gap: effectiveSpacing.elements.skillsColumnGap,
              marginTop: effectiveSpacing.elements.contentSpacing
            }}>
              <div>
                <h3 style={{ color: colorPalette.text, fontWeight: 400, fontSize: effectiveFontSizes.subSectionHeader }}>{t.technical}</h3>
                <div style={{ 
                  marginTop: effectiveSpacing.elements.margin,
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: effectiveSpacing.elements.tagGap
                }}>
                  {data.skills.technical.map((skill, index) => (
                    <span key={index} style={{ 
                      backgroundColor: colorPalette.primaryLight, 
                      color: colorPalette.primaryText, 
                      padding: effectiveSpacing.elements.tagPadding,
                      borderRadius: effectiveSpacing.elements.skillsBorderRadius,
                      fontSize: effectiveFontSizes.tagText
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ color: colorPalette.text, fontWeight: 400, fontSize: effectiveFontSizes.subSectionHeader }}>{t.soft}</h3>
                <div style={{ 
                  marginTop: effectiveSpacing.elements.margin,
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: effectiveSpacing.elements.tagGap
                }}>
                  {data.skills.soft.map((skill, index) => (
                    <span key={index} style={{ 
                      backgroundColor: colorPalette.secondaryLight, 
                      color: colorPalette.secondaryText, 
                      padding: effectiveSpacing.elements.tagPadding,
                      borderRadius: effectiveSpacing.elements.skillsBorderRadius,
                      fontSize: effectiveFontSizes.tagText
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: effectiveSpacing.elements.itemMargin }}>
              <h3 style={{ color: colorPalette.text, fontWeight: 400, fontSize: effectiveFontSizes.subSectionHeader }}>{t.languages}</h3>
              <div style={{ 
                marginTop: effectiveSpacing.elements.margin,
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: effectiveSpacing.elements.languagesItemGap
              }}>
                {data.skills.languages.filter(lang => lang.language && lang.level).map((lang, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: effectiveSpacing.elements.margin,
                    fontSize: effectiveFontSizes.tagText
                  }}>
                    <span style={{ fontWeight: 400 }}>{lang.language}:</span>
                    <span style={{ backgroundColor: colorPalette.grayLight, padding: '0 4px', borderRadius: '4px' }}>{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Klauzula RODO */}
      {hasContent.rodo && data.rodoClause && isLastPage && data.showRodoClause !== false && (
        <div style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          borderTop: `${effectiveSpacing.rodo.borderWidth} solid ${colorPalette.grayMedium}`,
          paddingTop: effectiveSpacing.rodo.topMargin,
          paddingLeft: effectiveSpacing.document.paddingSides,
          paddingRight: effectiveSpacing.document.paddingSides,
          paddingBottom: effectiveSpacing.document.paddingBottom,
          backgroundColor: '#fff',
          zIndex: 10
        }}>
          <p style={{ 
            fontSize: effectiveFontSizes.rodoText, 
            color: colorPalette.textLight, 
            lineHeight: '1.2',
            margin: 0
          }}>{data.rodoClause}</p>
        </div>
      )}
    </div>
  );
};

export default ModernCVTemplate;
