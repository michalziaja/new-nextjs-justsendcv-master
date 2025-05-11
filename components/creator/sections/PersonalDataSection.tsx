import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import { CVData, useCV } from '../CVContext';
import { FaLinkedin, FaGithub, FaGlobe, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";
import { IoMdCheckboxOutline, IoMdSquareOutline } from "react-icons/io";

interface PersonalDataSectionProps {
  cvData: CVData;
  updatePersonalData: (field: string, value: string) => void;
  selectedJob: any; // Dostosuj typ do faktycznej struktury selectedJob
  setSelectedJob: (job: any) => void;
  onBack: () => void;
  onNext: () => void;
}

// Interfejs dla linku społecznościowego
interface SocialLink {
  type: string;
  url: string;
  include: boolean;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  cvData,
  updatePersonalData,
  selectedJob,
  setSelectedJob,
  onBack,
  onNext
}) => {
  const { saveCV, isSaving, loadUserProfile } = useCV();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(cvData.personalData.socialLinks || []);
  
  // Pobierz dane profilu przy pierwszym renderowaniu
  useEffect(() => {
    // Ładowanie danych z profilu użytkownika
    loadUserProfile();
  }, [loadUserProfile]);
  
  // Aktualizacja stanu socialLinks gdy zmienią się dane CV
  useEffect(() => {
    if (cvData.personalData.socialLinks) {
      setSocialLinks(cvData.personalData.socialLinks);
    }
  }, [cvData.personalData.socialLinks]);
  
  // Funkcja do zmiany stanu "include" dla linku społecznościowego
  const toggleSocialLinkInclude = (index: number) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      include: !updatedLinks[index].include
    };
    setSocialLinks(updatedLinks);
    
    // Aktualizacja danych personalnych w CV poprzez przekazanie nowej tablicy linków
    // Używamy funkcji updatePersonalData zamiast próbować bezpośrednio używać setCvData
    // Funkcja ta oczekuje nazwę pola i wartość, więc przekazujemy 'socialLinks' jako pole
    updatePersonalData('socialLinks', updatedLinks);
  };
  
  // Funkcja pomocnicza zwracająca ikonę dla danego typu linku
  const getSocialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin className="text-blue-600" />;
      case 'github':
        return <FaGithub className="text-gray-800" />;
      case 'portfolio':
      case 'website':
        return <FaGlobe className="text-green-600" />;
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      case 'facebook':
        return <FaFacebook className="text-blue-700" />;
      case 'instagram':
        return <FaInstagram className="text-pink-600" />;
      default:
        return <FaGlobe className="text-gray-500" />;
    }
  };
  
  return (
    <div className="flex flex-col h-full ">
      <div className="p-4 ml-6">
        <h3 className="text-lg font-semibold mb-2">Dane osobowe</h3>
        <p className="text-gray-600 mb-4">Wprowadź swoje podstawowe dane kontaktowe</p>
        
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
        
        {/* Sekcja linków społecznościowych */}
        {socialLinks.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">Linki społecznościowe</h4>
            <p className="text-gray-600 mb-3 text-sm">Wybierz, które linki chcesz uwzględnić w swoim CV</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center border rounded-md p-2 hover:bg-gray-50">
                  {/* Checkbox do uwzględnienia linku w CV */}
                  <button 
                    type="button"
                    onClick={() => toggleSocialLinkInclude(index)}
                    className="mr-2 focus:outline-none"
                    title={link.include ? "Kliknij, aby usunąć z CV" : "Kliknij, aby dodać do CV"}
                  >
                    {link.include ? (
                      <IoMdCheckboxOutline className="w-5 h-5 text-blue-500" />
                    ) : (
                      <IoMdSquareOutline className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {/* Ikona typu linku */}
                  <div className="mr-2">
                    {getSocialIcon(link.type)}
                  </div>
                  
                  {/* Informacje o linku */}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{link.type}</div>
                    <div className="text-xs text-gray-500 truncate">{link.url}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Zaznacz checkboxy przy linkach, które chcesz uwzględnić w swoim CV. Aby edytować linki, przejdź do sekcji edycji profilu.
            </p>
          </div>
        )}
      </div>
      {/* Kontener przycisków - zawsze na dole */}
      <div className="mt-auto flex justify-between border-t-2 p-4 w-full">
        <div>
          <button 
            className="px-4 py-1 h-8 w-24 bg-gradient-to-r from-gray-500/80 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-sm transition"
            onClick={onBack}
          >
            Wstecz
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="px-4 py-1 h-8 w-24 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-sm  transition"
            onClick={() => saveCV(false)}
            disabled={isSaving}
          >
            {isSaving ? 'Zapis...' : 'Zapisz'}
          </button>
          
          <button 
            className="px-4 py-1 h-8 w-24 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-sm transition"
            onClick={onNext}
          >
            Dalej
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalDataSection; 