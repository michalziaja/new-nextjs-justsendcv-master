import React from 'react';
import { IoClose } from "react-icons/io5";
import { CVData } from './CVContext';

// Rozszerzony interfejs do obsługi wszystkich pól danych personalnych
interface ExtendedPersonalData extends CVData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    title?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

// Interfejs dla props komponentu sekcji danych personalnych
interface PersonalDataSectionProps {
  cvData: ExtendedPersonalData;
  updatePersonalData: (field: string, value: string) => void;
  selectedJob: any; // Typ dla wybranego stanowiska
  setSelectedJob: (job: any) => void;
  onBack: () => void;
  onNext: () => void;
  isValid?: boolean; // Opcjonalny parametr walidacji
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  cvData,
  updatePersonalData,
  selectedJob,
  setSelectedJob,
  onBack,
  onNext,
  isValid = true // Domyślna wartość to true jeśli nie podano
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold mb-2">Dane osobowe</h3>
        <p className="text-gray-600 mb-4">Wprowadź swoje podstawowe dane kontaktowe i informacje osobowe.</p>
        
        {/* Informacja o wybranym stanowisku z możliwością edycji/usunięcia */}
        {selectedJob && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-700">Informacja o aplikowanym stanowisku:</h4>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                title="Usuń wybrane stanowisko"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stanowisko</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm" 
                  value={selectedJob.title}
                  onChange={(e) => {
                    // Tworzymy kopię obiektu i aktualizujemy tytuł
                    const updatedJob = {...selectedJob, title: e.target.value};
                    setSelectedJob(updatedJob);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Firma</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm" 
                  value={selectedJob.company}
                  onChange={(e) => {
                    // Tworzymy kopię obiektu i aktualizujemy firmę
                    const updatedJob = {...selectedJob, company: e.target.value};
                    setSelectedJob(updatedJob);
                  }}
                />
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Ta informacja będzie widoczna w nagłówku Twojego CV. Możesz ją edytować lub usunąć.
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              placeholder="Jan"
              value={cvData.personalData.firstName}
              onChange={(e) => updatePersonalData('firstName', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              placeholder="Kowalski"
              value={cvData.personalData.lastName}
              onChange={(e) => updatePersonalData('lastName', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail</label>
            <input 
              type="email" 
              className="w-full border rounded-md px-3 py-2" 
              placeholder="jan.kowalski@example.com"
              value={cvData.personalData.email}
              onChange={(e) => updatePersonalData('email', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input 
              type="tel" 
              className="w-full border rounded-md px-3 py-2" 
              placeholder="+48 123 456 789"
              value={cvData.personalData.phone}
              onChange={(e) => updatePersonalData('phone', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Miejscowość</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              placeholder="Warszawa"
              value={cvData.personalData.city || ''}
              onChange={(e) => updatePersonalData('city', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zawód</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              placeholder="Frontend Developer"
              value={cvData.personalData.title || ''}
              onChange={(e) => updatePersonalData('title', e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Dodatkowe dane (opcjonalnie)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
              <input 
                type="text" 
                className="w-full border rounded-md px-3 py-2" 
                placeholder="linkedin.com/in/jankowalski"
                value={cvData.personalData.linkedin || ''}
                onChange={(e) => updatePersonalData('linkedin', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">GitHub</label>
              <input 
                type="text" 
                className="w-full border rounded-md px-3 py-2" 
                placeholder="github.com/jankowalski"
                value={cvData.personalData.github || ''}
                onChange={(e) => updatePersonalData('github', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Portfolio / Strona WWW</label>
              <input 
                type="text" 
                className="w-full border rounded-md px-3 py-2" 
                placeholder="jankowalski.pl"
                value={cvData.personalData.website || ''}
                onChange={(e) => updatePersonalData('website', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Kontener przycisków - zawsze na dole */}
      <div className="mt-auto pt-6 flex justify-between">
        <button 
          className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-sm hover:from-gray-400 hover:to-gray-500 transition"
          onClick={onBack}
        >
          Wstecz
        </button>
        
        <button 
          className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
          disabled={!isValid}
          onClick={onNext}
          title={!isValid ? "Wypełnij wymagane pola, aby kontynuować" : ""}
        >
          Dalej
        </button>
      </div>
    </div>
  );
};

export default PersonalDataSection; 