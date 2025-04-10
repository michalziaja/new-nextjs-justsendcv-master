"use client";

import React from 'react';
import { mockJobOffers } from './mockData';
import { useCV } from './CVContext';

// Dodaję definicję interfejsu dla props
interface CreatorProps {
  toggleButton?: React.ReactNode;
}

// Komponent dla lewej strony - kreator
export default function Creator({ toggleButton }: CreatorProps) {
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

  // Funkcja do dodawania nowego doświadczenia
  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [
        ...cvData.experience,
        {
          position: '',
          company: '',
          startDate: '',
          endDate: '',
          description: ''
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
                      className={`p-3 mb-2 rounded cursor-pointer hover:bg-gray-100 transition ${selectedJob?.id === job.id ? 'bg-blue-50 border border-blue-300' : 'bg-white border'}`}
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
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : ''}`}
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
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('start')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('personalData')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
            <h3 className="text-lg font-semibold mb-2">Doświadczenie zawodowe</h3>
            <p className="text-gray-600 mb-4">Dodaj informacje o swoim doświadczeniu zawodowym</p>
            
            {cvData.experience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stanowisko</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Wprowadź nazwę stanowiska"
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Wprowadź nazwę firmy"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opis obowiązków</label>
                  <textarea 
                    className="w-full border rounded-md px-3 py-2 h-24" 
                    placeholder="Opisz swoje obowiązki i osiągnięcia"
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
            
            <button 
              className="w-full border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
              onClick={addExperience}
            >
              + Dodaj kolejne doświadczenie
            </button>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('description')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('experience')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('education')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('courses')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
            
            <div className="border rounded-lg divide-y">
              <div className="p-3 flex justify-between items-center">
                <span>Dane osobowe</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('personalData')}
                >
                  Edytuj
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>Opis profilu</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('description')}
                >
                  Edytuj
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>Doświadczenie</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('experience')}
                >
                  Edytuj
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>Wykształcenie</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('education')}
                >
                  Edytuj
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>Kursy</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('courses')}
                >
                  Edytuj
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>Umiejętności</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('skills')}
                >
                  Edytuj
                </button>
              </div>
            </div>
            
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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
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
    <div className="flex flex-col gap-4 h-[calc(90vh-4.5rem)]">
      
      {/* Pasek postępu w jednym rzędzie z przyciskiem przełączania (jeśli istnieje) */}
      <div className="flex h-16 mb-1 gap-2">
        {/* Pasek postępu */}
        <div className={`h-12 ${toggleButton ? 'flex-1' : 'w-full'} ml-2 mr-0 bg-white dark:bg-sidebar rounded-md shadow-[2px_4px_10px_rgba(0,0,0,0.3)]`}>
          {/* Responsywne plakietki postępu */}
          <div className="mt-2.5 ml-1 flex justify-between rounded-md mb-2 w-full overflow-x-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
              msOverflowStyle: 'none',  /* IE and Edge */
              scrollbarGutter: 'stable' /* dla nowoczesnych przeglądarek */
            }}
          >
            <div 
              className={`px-1 xs:px-1.5 sm:px-4 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[11px] sm:text-xs md:text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0
                ${activeSection === 'start' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveSection('start')}
            >
              Start
            </div>
            <div 
              className={`px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] xs:text-[11px] sm:text-xs cursor-pointer transition whitespace-nowrap flex-shrink-0
                ${activeSection === 'personalData' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveSection('personalData')}
            >
              Dane
            </div>
            <div 
              className={`px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] xs:text-[11px] sm:text-xs cursor-pointer transition whitespace-nowrap flex-shrink-0
                ${activeSection === 'description' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveSection('description')}
            >
              Opis
            </div>
            <div 
              className={`px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] xs:text-[11px] sm:text-xs cursor-pointer transition whitespace-nowrap flex-shrink-0
                ${activeSection === 'experience' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveSection('experience')}
            >
              Doświadczenie
            </div>
            <div 
              className={`px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] xs:text-[11px] sm:text-xs cursor-pointer transition whitespace-nowrap flex-shrink-0
                ${activeSection === 'education' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveSection('education')}
            >
              Edukacja
            </div>
            <div 
              className={`px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] xs:text-[11px] sm:text-xs cursor-pointer transition whitespace-nowrap flex-shrink-0
                ${activeSection === 'courses' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveSection('courses')}
            >
              Kursy
            </div>
            <div 
              className={`px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] xs:text-[11px] sm:text-xs cursor-pointer transition whitespace-nowrap flex-shrink-0
                ${activeSection === 'skills' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveSection('skills')}
            >
              Umiejętności
            </div>
            <div 
              className={`px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] xs:text-[11px] sm:text-xs cursor-pointer transition whitespace-nowrap flex-shrink-0
                ${activeSection === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveSection('summary')}
            >
              Podsumowanie
            </div>
          </div>
        </div>
        
        {/* Przycisk przełączania (jeśli przekazany) */}
        {toggleButton && (
          <div className="mr-2">
            {toggleButton}
          </div>
        )}
      </div>
      
      {/* Główny kontener */}
      <div className="bg-white dark:bg-sidebar mr-2 ml-2 rounded-lg shadow-[2px_4px_10px_rgba(0,0,0,0.3)] flex-1 overflow-hidden flex flex-col">
        {/* Aktywna sekcja formularza - przewijalna */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}