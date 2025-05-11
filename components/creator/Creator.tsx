//components/creator/Creator.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCV } from './CVContext';
import { createClient } from "@/utils/supabase/client";
import { spacing as defaultSpacing, fontSizes as defaultFontSizes } from './templates/TemplateStyles';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

// Importy komponentów
import CreatorHeader from './CreatorHeader';
import StartSection from './sections/StartSection';
import PersonalDataSection from './sections/PersonalDataSection';
import DescriptionSection from './sections/DescriptionSection';
import ExperienceSection from './sections/ExperienceSection';
import ProjectsSection from './sections/ProjectsSection';
import EducationSection from './sections/EducationSection';
import CoursesSection from './sections/CoursesSection';
import SkillsSection from './sections/SkillsSection';
import SummarySection from './sections/SummarySection';

// Komponent dla lewej strony - kreator
export default function Creator({ switchMode }: { switchMode?: () => void }) {
  // Używamy kontekstu CV
  const {
    cvData,
    setCvData,
    selectedJob,
    setSelectedJob,
    selectedTemplate,
    setSelectedTemplate,
    activeSection,
    setActiveSection,
    showProjectsInPreview,
    setShowProjectsInPreview,
    lastSaved,
    isSaving,
    saveCV,
    savedJobs,
    isLoadingJobs
  } = useCV();
  
  // Stan do przechowywania poprzedniej aktywnej sekcji
  const [previousSection, setPreviousSection] = useState<string | null>(null);
  
  // Ref dla kontenera z plakietkami i stan do śledzenia przewijania
  const badgeContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Sprawdzanie, czy kontener wymaga przewijania
  useEffect(() => {
    const checkScrolling = () => {
      if (badgeContainerRef.current) {
        const { scrollWidth, clientWidth } = badgeContainerRef.current;
        setIsScrolling(scrollWidth > clientWidth);
      }
    };

    // Sprawdź na początku i przy zmianach rozmiaru okna
    checkScrolling();
    window.addEventListener('resize', checkScrolling);
    
    return () => {
      window.removeEventListener('resize', checkScrolling);
    };
  }, []);
  
  // Aktualizacja widoczności projektów w podglądzie na podstawie aktywnej sekcji
  useEffect(() => {
    // Definiujemy kolejność sekcji do określenia, czy sekcja projekty powinna być widoczna
    const sectionsOrder = ['start', 'personalData', 'description', 'experience', 'projects', 'education', 'courses', 'skills', 'summary'];
    
    // Uzyskaj indeksy dla obecnej i poprzedniej sekcji
    const currentIndex = sectionsOrder.indexOf(activeSection);
    const projectsIndex = sectionsOrder.indexOf('projects');
    
    // Warunki pokazywania projektów:
    // 1. Jesteśmy w sekcji 'projects'
    // 2. Jesteśmy w sekcji, która jest po 'projects' w kolejności
    if (activeSection === 'projects' || (currentIndex > projectsIndex && projectsIndex !== -1)) {
      setShowProjectsInPreview(true);
    } else {
      // W przeciwnym razie ukryj projekty w podglądzie
      setShowProjectsInPreview(false);
    }
    
    // Aktualizujemy poprzednią sekcję, jeśli się zmieniła
    if (previousSection !== activeSection) {
      setPreviousSection(activeSection);
    }
  }, [activeSection, previousSection, setShowProjectsInPreview]);
  
  // Dostępne szablony CV
  const templates = [
    { id: 'nowoczesny', name: 'Nowoczesny' },
  ];

  // Funkcja do aktualizacji danych osobowych
  const updatePersonalData = (field: string, value: string) => {
    setCvData({
      ...cvData,
      personalData: {
        ...cvData.personalData,
        [field]: value
      }
    });
  };

  // Funkcja do aktualizacji opisu profilu
  const updateDescription = (value: string) => {
    setCvData({
      ...cvData,
      description: value
    });
  };

  // Funkcja do aktualizacji doświadczenia
  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExperience = [...cvData.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    
    setCvData({
      ...cvData,
      experience: updatedExperience
    });
  };

  // Funkcja do usuwania doświadczenia
  const removeExperience = (index: number) => {
    const updatedExperience = cvData.experience.filter((_, i) => i !== index);
    setCvData({
      ...cvData,
      experience: updatedExperience
    });
  };

  // Funkcja do dodawania nowego doświadczenia
  const addExperience = (type: 'job' | 'project' = 'job') => {
    // Sprawdzamy, czy próbujemy dodać doświadczenie, gdy już istnieją projekty
    if (type === 'job' && cvData.experience.some(exp => exp.type === 'project')) {
      alert('Nie można dodać doświadczenia zawodowego po dodaniu projektów. Najpierw dodaj wszystkie doświadczenia zawodowe.');
      return;
    }
    
    setCvData({
      ...cvData,
      experience: [
        ...cvData.experience,
        {
          position: '',
          company: '',
          startDate: '',
          endDate: '',
          description: '',
          type: type
        }
      ]
    });
  };

  // Funkcja do aktualizacji wykształcenia
  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...cvData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    setCvData({
      ...cvData,
      education: updatedEducation
    });
  };

  // Funkcja do usuwania wykształcenia
  const removeEducation = (index: number) => {
    const updatedEducation = cvData.education.filter((_, i) => i !== index);
    setCvData({
      ...cvData,
      education: updatedEducation
    });
  };

  // Funkcja do dodawania nowego wykształcenia
  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [
        ...cvData.education,
        {
          school: '',
          degree: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });
  };

  // Funkcja do aktualizacji umiejętności technicznych
  const updateTechnicalSkills = (value: string) => {
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        technical: value.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
      }
    });
  };

  // Funkcja do aktualizacji umiejętności miękkich
  const updateSoftSkills = (value: string) => {
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        soft: value.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
      }
    });
  };

  // Funkcja do aktualizacji języków
  const updateLanguage = (index: number, field: string, value: string) => {
    const updatedLanguages = [...cvData.skills.languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    };
    
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        languages: updatedLanguages
      }
    });
  };

  // Funkcja do dodawania nowego języka
  const addLanguage = () => {
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        languages: [
          ...cvData.skills.languages,
          { language: '', level: '' }
        ]
      }
    });
  };

  // Funkcja do aktualizacji kursów
  const updateCourse = (index: number, field: string, value: string) => {
    const updatedCourses = [...cvData.courses || []];
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: value
    };
    
    setCvData({
      ...cvData,
      courses: updatedCourses
    });
  };

  // Funkcja do usuwania kursu
  const removeCourse = (index: number) => {
    const updatedCourses = (cvData.courses || []).filter((_, i) => i !== index);
    setCvData({
      ...cvData,
      courses: updatedCourses
    });
  };

  // Funkcja do dodawania nowego kursu
  const addCourse = () => {
    setCvData({
      ...cvData,
      courses: [
        ...(cvData.courses || []),
        {
          name: '',
          organizer: '',
          date: '',
          certificateNumber: ''
        }
      ]
    });
  };

  // Funkcja do renderowania odpowiedniej sekcji
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'start':
        return (
          <StartSection 
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            templates={templates}
            savedJobs={savedJobs}
            isLoadingJobs={isLoadingJobs}
            onNext={() => setActiveSection('personalData')}
          />
        );
        
      case 'personalData':
        return (
          <PersonalDataSection 
            cvData={cvData}
            updatePersonalData={updatePersonalData}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            onBack={() => setActiveSection('start')}
            onNext={() => setActiveSection('description')}
          />
        );
        
      case 'description':
        return (
          <DescriptionSection 
            cvData={cvData}
            updateDescription={updateDescription}
            onBack={() => setActiveSection('personalData')}
            onNext={() => setActiveSection('experience')}
          />
        );
        
      case 'experience':
        return (
          <ExperienceSection 
            cvData={cvData}
            updateExperience={updateExperience}
            removeExperience={removeExperience}
            addExperience={addExperience}
            onBack={() => setActiveSection('description')}
            onNext={() => setActiveSection('projects')}
          />
        );
        
      case 'projects':
        return (
          <ProjectsSection 
            cvData={cvData}
            updateExperience={updateExperience}
            removeExperience={removeExperience}
            addExperience={addExperience}
            onBack={() => setActiveSection('experience')}
            onNext={() => setActiveSection('education')}
          />
        );
        
      case 'education':
        return (
          <EducationSection 
            cvData={cvData}
            updateEducation={updateEducation}
            removeEducation={removeEducation}
            addEducation={addEducation}
            onBack={() => setActiveSection('projects')}
            onNext={() => setActiveSection('courses')}
          />
        );
        
      case 'courses':
        return (
          <CoursesSection 
            cvData={cvData}
            updateCourse={updateCourse}
            removeCourse={removeCourse}
            addCourse={addCourse}
            onBack={() => setActiveSection('education')}
            onNext={() => setActiveSection('skills')}
          />
        );
        
      case 'skills':
        return (
          <SkillsSection 
            cvData={cvData}
            setCvData={setCvData}
            updateTechnicalSkills={updateTechnicalSkills}
            updateSoftSkills={updateSoftSkills}
            updateLanguage={updateLanguage}
            addLanguage={addLanguage}
            onBack={() => setActiveSection('courses')}
            onNext={() => setActiveSection('summary')}
          />
        );
        
      case 'summary':
        return (
          <SummarySection
            cvData={cvData}
            setCvData={setCvData}
            selectedJob={selectedJob}
            selectedTemplate={selectedTemplate}
            templates={templates}
            defaultSpacing={defaultSpacing}
            defaultFontSizes={defaultFontSizes}
            onBack={() => setActiveSection('skills')}
          />
        );
        
      default:
        return null;
    }
  };

  // W komponencie renderującym przyciski nawigacji, usuń przycisk "Zapisz CV":
  const renderNavigationButtons = () => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* ... istniejące przyciski nawigacji */}
        </div>
        
        <div className="flex items-center">
          {lastSaved && (
            <div className="text-xs text-gray-500 mr-1">
              {isSaving 
                ? 'Zapisywanie...' 
                : `Ostatnio zapisano: ${format(lastSaved, 'HH:mm:ss', { locale: pl })}`
              }
            </div>
          )}
          
          {/* Przycisk "Zapisz CV" został usunięty */}
          
          {/* ... inne przyciski */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col -ml-1 gap-1 mb-1">
      {/* Nagłówek kreatora z paskiem postępu */}
      <CreatorHeader 
        activeSection={activeSection}
        badgeContainerRef={badgeContainerRef}
        isScrolling={isScrolling}
        switchMode={switchMode}
      />
      
      {/* Główny kontener */}
      <div className="bg-white dark:bg-sidebar border-1 border-gray-300 dark:border-gray-800 mr-2 ml-3 rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] flex-1 overflow-hidden flex flex-col">
        {/* Wskaźnik auto-save i przycisk zapisu - jeśli nie jesteśmy na ekranie startowym */}
        {activeSection !== 'start' && (
          <div className="px-1 py-1">
            {renderNavigationButtons()}
          </div>
        )}
        
        {/* Aktywna sekcja formularza - przewijalna */}
        <div className="flex-1 overflow-y-auto px-0 py-0"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}