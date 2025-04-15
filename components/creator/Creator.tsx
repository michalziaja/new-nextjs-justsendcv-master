"use client";

import React, { useState, useEffect, useRef } from 'react';
import { mockJobOffers } from './mockData';
import { useCV } from './CVContext';
import { IoMdEye } from "react-icons/io";
import { IoClose } from "react-icons/io5";

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
    setActiveSection
  } = useCV();
  
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
          type: type // Dodajemy pole type, aby rozróżniać projekty od doświadczenia
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
  
  // Funkcja do renderowania odpowiedniej sekcji
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'start':
        return (
          <div className="space-y-4">
            
            <div className="space-y-6">
              {/* Wybór oferty pracy */}
              <div>
                <h1 className="font-medium text-xl text-gray-900 mb-4">1. Wybierz ofertę pracy</h1>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                  {mockJobOffers.map(job => (
                <div 
                  key={job.id} 
                  className={`p-3 mb-2 rounded cursor-pointer hover:bg-gray-100 transition ${selectedJob?.id === job.id ? 'bg-gradient-to-r from-[#00B2FF]/20 to-blue-600/20 border border-blue-300' : 'bg-white border'}`}
                  onClick={() => setSelectedJob(job)}
                >
                  <h4 className="font-medium">{job.position}</h4>
                  <p className="text-sm text-gray-600">{job.company}</p>
                </div>
              ))}
            </div>
          </div>
              
              {/* Wybór szablonu */}
              <div>
                <h4 className="font-medium text-xl text-gray-900 mb-4">2.Wybierz szablon CV</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map(template => (
                <div 
                  key={template.id} 
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${selectedTemplate === template.id ? 'border-blue-500 bg-gradient-to-r from-[#00B2FF]/20 to-blue-600/20' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                      <div className="h-24 mb-2 bg-gray-200 rounded flex items-center justify-center">
                    {/* Tutaj później dodamy podgląd szablonu */}
                        <span className="text-xs text-center">Szablon {template.name}</span>
                      </div>
                      <p className="font-medium text-center text-sm">{template.name}</p>
                  </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition disabled:from-gray-400 disabled:to-gray-500"
                disabled={!selectedJob}
                onClick={() => setActiveSection('personalData')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'personalData':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Dane osobowe</h3>
            <p className="text-gray-600 mb-4">Wprowadź swoje podstawowe dane kontaktowe</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź imię"
                  value={cvData.personalData.firstName}
                  onChange={(e) => updatePersonalData('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź nazwisko"
                  value={cvData.personalData.lastName}
                  onChange={(e) => updatePersonalData('lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź email"
                  value={cvData.personalData.email}
                  onChange={(e) => updatePersonalData('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input 
                  type="tel" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź numer telefonu"
                  value={cvData.personalData.phone}
                  onChange={(e) => updatePersonalData('phone', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź adres"
                  value={cvData.personalData.address}
                  onChange={(e) => updatePersonalData('address', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded hover:from-gray-400 hover:to-gray-500 transition"
                onClick={() => setActiveSection('start')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
                onClick={() => setActiveSection('experience')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Doświadczenie zawodowe i projekty</h3>
            <p className="text-gray-600 mb-4">Dodaj informacje o swoim doświadczeniu zawodowym lub projektach</p>
            
            {cvData.experience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 mb-4 relative">
                <div className="absolute top-2 right-2">
                  <button 
                    onClick={() => removeExperience(index)}
                    className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                    title="Usuń wpis"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center mb-2">
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={exp.type !== 'project'}
                      onChange={() => updateExperience(index, 'type', 'job')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Doświadczenie</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={exp.type === 'project'}
                      onChange={() => updateExperience(index, 'type', 'project')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Projekt</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {exp.type === 'project' ? 'Nazwa projektu' : 'Stanowisko'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder={exp.type === 'project' ? 'Wprowadź nazwę projektu' : 'Wprowadź nazwę stanowiska'}
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {exp.type === 'project' ? 'Technologie / narzędzia' : 'Firma'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder={exp.type === 'project' ? 'Np. React, Node.js, TypeScript' : 'Wprowadź nazwę firmy'}
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data rozpoczęcia</label>
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data zakończenia</label>
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {exp.type === 'project' ? 'Opis projektu' : 'Opis obowiązków'}
                  </label>
                  <textarea 
                    className="w-full border rounded-md px-3 py-2 h-24" 
                    placeholder={exp.type === 'project' ? 'Opisz swój projekt, jego cel i Twoją rolę' : 'Opisz swoje obowiązki i osiągnięcia'}
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
            
            <div className="flex space-x-2">
              <button 
                className="w-1/2 border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
                onClick={() => addExperience('job')}
              >
                + Dodaj doświadczenie
              </button>
            <button 
                className="w-1/2 border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
                onClick={() => addExperience('project')}
            >
                + Dodaj projekt
            </button>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-sm hover:from-gray-400 hover:to-gray-500 transition"
                onClick={() => setActiveSection('personalData')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
                onClick={() => setActiveSection('education')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Wykształcenie</h3>
            <p className="text-gray-600 mb-4">Dodaj informacje o swoim wykształceniu</p>
            
            {cvData.education.map((edu, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uczelnia/Szkoła</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Wprowadź nazwę uczelni/szkoły"
                    value={edu.school}
                    onChange={(e) => updateEducation(index, 'school', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kierunek/Specjalizacja</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Wprowadź kierunek/specjalizację"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data rozpoczęcia</label>
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data zakończenia</label>
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dodatkowe informacje</label>
                  <textarea 
                    className="w-full border rounded-md px-3 py-2 h-24" 
                    placeholder="Np. średnia ocen, ważne projekty, osiągnięcia"
                    value={edu.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
            
            <button 
              className="w-full border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
              onClick={addEducation}
            >
              + Dodaj kolejne wykształcenie
            </button>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-sm hover:from-gray-400 hover:to-gray-500 transition"
                onClick={() => setActiveSection('experience')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
                onClick={() => setActiveSection('courses')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'courses':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Kursy i certyfikaty</h3>
            <p className="text-gray-600 mb-4">Dodaj informacje o ukończonych kursach i certyfikatach</p>
            
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa kursu/certyfikatu</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Np. Kurs Java Developer"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizator</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Np. Nazwa firmy szkoleniowej"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data uzyskania</label>
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numer certyfikatu (opcjonalnie)</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Np. ABC-123456"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
              >
                + Dodaj kolejny kurs
              </button>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded hover:from-gray-400 hover:to-gray-500 transition"
                onClick={() => setActiveSection('education')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
                onClick={() => setActiveSection('skills')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'skills':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Umiejętności</h3>
            <p className="text-gray-600 mb-4">Dodaj swoje umiejętności istotne dla wybranej oferty pracy</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Umiejętności techniczne</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Np. Java, Python, SQL (rozdziel przecinkami)"
                  value={cvData.skills.technical.join(', ')}
                  onChange={(e) => updateTechnicalSkills(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Umiejętności miękkie</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Np. praca w zespole, komunikacja (rozdziel przecinkami)"
                  value={cvData.skills.soft.join(', ')}
                  onChange={(e) => updateSoftSkills(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Języki obce</label>
                <div className="border rounded-lg p-3 space-y-2">
                  {cvData.skills.languages.map((lang, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                      <input 
                        type="text" 
                        className="border rounded-md px-3 py-2" 
                        placeholder="Język"
                        value={lang.language}
                        onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                      />
                      <select 
                        className="border rounded-md px-3 py-2"
                        value={lang.level}
                        onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                      >
                        <option value="">Wybierz poziom</option>
                        <option value="A1">A1 - Początkujący</option>
                        <option value="A2">A2 - Podstawowy</option>
                        <option value="B1">B1 - Średniozaawansowany</option>
                        <option value="B2">B2 - Wyższy średniozaawansowany</option>
                        <option value="C1">C1 - Zaawansowany</option>
                        <option value="C2">C2 - Biegły</option>
                      </select>
                    </div>
                  ))}
                  <button 
                    className="w-full border-dashed border border-gray-300 rounded py-1 text-sm text-gray-500 hover:bg-gray-50 transition"
                    onClick={addLanguage}
                  >
                    + Dodaj kolejny język
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-sm hover:from-gray-400 hover:to-gray-500 transition"
                onClick={() => setActiveSection('courses')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
                onClick={() => setActiveSection('description')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'description':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Opis profilu</h3>
            <p className="text-gray-600 mb-4">Wprowadź krótki opis swojego profilu zawodowego, umiejętności i celów</p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profil zawodowy</label>
              <textarea 
                className="w-full border rounded-md px-3 py-2 h-64" 
                placeholder="Napisz krótkie wprowadzenie o sobie, swoim doświadczeniu, umiejętnościach i celach zawodowych. Ten tekst będzie widoczny na początku Twojego CV."
                value={cvData.description}
                onChange={(e) => updateDescription(e.target.value)}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Dobry opis powinien zawierać 3-5 zdań podsumowujących Twoje kluczowe kompetencje i doświadczenie.
              </p>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-sm hover:from-gray-400 hover:to-gray-500 transition"
                onClick={() => setActiveSection('skills')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
                onClick={() => setActiveSection('summary')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'summary':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Podsumowanie</h3>
            <p className="text-gray-600 mb-4">Sprawdź wszystkie wprowadzone informacje</p>
            
            {selectedJob && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium">Wybrana oferta pracy:</p>
                <p><span className="font-medium">{selectedJob.position}</span> - {selectedJob.company}</p>
              </div>
            )}
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium">Wybrany szablon:</p>
              <p>{templates.find(t => t.id === selectedTemplate)?.name}</p>
            </div>
            
            {/*  */}
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 mb-2">Klauzula RODO</h4>
              <p className="text-xs text-gray-600 mb-2">
                Dodaj klauzulę RODO, która będzie widoczna na dole dokumentu CV
              </p>
              <textarea 
                className="w-full border rounded-md px-3 py-2 h-32 text-xs" 
                placeholder="Wpisz swoją klauzulę RODO, np.: Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z Ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych oraz Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r.)."
                value={cvData.rodoClause || ''}
                onChange={(e) => setCvData({...cvData, rodoClause: e.target.value})}
              ></textarea>
            </div>
            
            <div className="flex justify-start mt-4">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded hover:from-gray-400 hover:to-gray-500 transition"
                onClick={() => setActiveSection('skills')}
              >
                Wstecz
              </button>
              <p className="text-sm text-gray-500 ml-4 self-center">
                Możesz pobrać swoje CV z panelu podglądu po prawej stronie.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col -ml-1 gap-4 mb-1">
      
      {/* Kontener dla paska postępu i przycisku przełączania */}
      <div className="flex items-center gap-0">
        {/* Pasek postępu w oddzielnej karcie */}
        {/* <div className="p-0 sm:p-2 md:p-4 h-14 mb-1 flex-grow mr-2 ml-3 border-1 border-gray-300 dark:border-gray-800 bg-white dark:bg-sidebar rounded-md shadow-[2px_4px_10px_rgba(0,0,0,0.3)] flex items-center overflow-hidden"> */}
          {/* Animowana linia postępu w tle kart */}
          <div className="ml-1 relative w-full">
            {!isScrolling && (
              <div className="absolute left-5 right-0 top-1/2 transform -translate-y-1/2 w-[calc(100%-12%)] h-1 bg-gray-200 dark:bg-gray-400 rounded-full overflow-hidden z-0 px-2">
                {(() => {
                  // Definiujemy kolejność sekcji
                  const sections = ['start', 'personalData', 'experience', 'education', 'courses', 'skills', 'description', 'summary'];
                  const currentIndex = sections.indexOf(activeSection);
                  
                  // Obliczanie pozycji dla konkretnej karty
                  const sectionWidth = 100 / sections.length;
                  const sectionStartPos = currentIndex * sectionWidth;
                  const sectionEndPos = sectionStartPos + sectionWidth;
                  
                  return (
                    <div 
                      className="absolute -left-5 top-0 h-full bg-gray-400 dark:bg-gray-600 transition-all duration-500 ease-in-out"
            style={{ 
                        width: `${sectionEndPos}%`,
                        backgroundImage: 'linear-gradient(to right, #10b981, #2563eb)'
                      }}
                    />
                  );
                })()}
              </div>
            )}
            
            {/* Responsywne plakietki postępu */}
            <div 
              ref={badgeContainerRef}
              className="flex justify-between items-center gap-x-0.5 xs:gap-x-1 sm:gap-x-2 w-full overflow-visible mb-0 relative z-10 py-2 px-2"
              style={{
                overflowY: 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
                WebkitOverflowScrolling: 'touch',
                margin: '4px 0'
              }}
            >
              <div 
                className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                  ${activeSection === 'start' ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                    ['personalData', 'experience', 'education', 'courses', 'skills', 'description', 'summary'].includes(activeSection) ? 
                    'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800'}`}
                onClick={() => setActiveSection('start')}
              >
                Start
              </div>
              <div 
                className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                  ${activeSection === 'personalData' ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                    ['experience', 'education', 'courses', 'skills', 'description', 'summary'].includes(activeSection) ? 
                    'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800'}`}
                onClick={() => setActiveSection('personalData')}
              >
                Dane
              </div>
              
              <div 
                className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                  ${activeSection === 'experience' ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                    ['education', 'courses', 'skills', 'description', 'summary'].includes(activeSection) ? 
                    'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800'}`}
                onClick={() => setActiveSection('experience')}
              >
                Doświad.
              </div>
              <div 
                className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                  ${activeSection === 'education' ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                    ['courses', 'skills', 'description', 'summary'].includes(activeSection) ? 
                    'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800'}`}
                onClick={() => setActiveSection('education')}
              >
                Edukacja
              </div>
              <div 
                className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                  ${activeSection === 'courses' ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                    ['skills', 'description', 'summary'].includes(activeSection) ? 
                    'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800'}`}
                onClick={() => setActiveSection('courses')}
              >
                Kursy
              </div>
              <div 
                className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                  ${activeSection === 'skills' ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                    ['description', 'summary'].includes(activeSection) ? 
                    'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800'}`}
                onClick={() => setActiveSection('skills')}
              >
                Umiejęt.
              </div>
              <div 
                className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                  ${activeSection === 'description' ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                    ['summary'].includes(activeSection) ? 
                    'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800'}`}
                onClick={() => setActiveSection('description')}
              >
                Opis
              </div>
              <div 
                className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                  ${activeSection === 'summary' ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800'}`}
                onClick={() => setActiveSection('summary')}
              >
                Podsum.
              </div>
            </div>
          </div>
          
          {/* Usuwamy niezależny pasek postępu, który był dodany poniżej */}
        {/* </div> */}
        
        {/* Przycisk przełączania - widoczny tylko gdy prop switchMode jest dostępny */}
        {switchMode && (
          <button
            onClick={switchMode}
            className="h-14 w-14 bg-transparent dark:bg-sidebar rounded-sm flex items-center justify-center mr-2 mb-1"
            title="Przełącz na podgląd"
          >
            <IoMdEye className="w-8 h-8 text-blue-600" />
          </button>
        )}
      </div>
      
      {/* Główny kontener */}
      <div className="bg-white dark:bg-sidebar border-1 border-gray-300 dark:border-gray-800 mr-2 ml-3 rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] flex-1 overflow-hidden flex flex-col">
        {/* Aktywna sekcja formularza - przewijalna */}
        <div className="flex-1 overflow-y-auto px-6 py-6"
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