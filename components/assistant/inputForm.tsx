"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InfoIcon, SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAssistant } from './assistantContext';

export default function InputForm() {
  const { 
    isGenerating, 
    jobOffers,
    userCVs,
    selectedJobOffer,
    selectedUserCV,
    additionalInfo, 
    savedTemplates,
    setSelectedJobOffer, 
    setSelectedUserCV, 
    setAdditionalInfo, 
    loadTemplate,
    deleteTemplate,
    generateText 
  } = useAssistant();

  // Stan dla wyszukiwania ofert
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOffers, setFilteredOffers] = useState(jobOffers);

  // Efekt filtrowania ofert przy zmianie wyszukiwania lub listy ofert
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOffers(jobOffers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = jobOffers.filter(offer => 
        offer.title.toLowerCase().includes(query) || 
        offer.company.toLowerCase().includes(query)
      );
      setFilteredOffers(filtered);
    }
  }, [searchQuery, jobOffers]);

  // Mapowanie statusów EN->PL
  const statusMap: Record<string, string> = {
    saved: 'zapisana',
    applied: 'aplikowano',
    send: 'wysłano',
    contact: 'kontakt',
    kontakt: 'kontakt',
    interview: 'rozmowa',
    rozmowa: 'rozmowa',
    offer: 'oferta',
    oferta: 'oferta',
    rejected: 'odrzucono',
    odmowa: 'odrzucono',
    accepted: 'zaakceptowano',
    expired: 'wygasła'
  };

  // Style dla statusów
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'saved': return 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white'
      case 'applied': 
      case 'send': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
      case 'contact': 
      case 'kontakt': return 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white'
      case 'interview': 
      case 'rozmowa': return 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white'
      case 'offer': 
      case 'oferta': return 'bg-gradient-to-r from-green-500 to-green-700 text-white'
      case 'rejected': 
      case 'odmowa': return 'bg-gradient-to-r from-red-500 to-red-700 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
    }
  }

  return (
    <Card className="p-4 space-y-4 rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-2 gap-4">
        {/* Wybór CV - lewa kolumna */}
        <div>
          <h3 className="text-sm font-medium mb-2">Twoje CV</h3>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(27vh)' }}>
            {userCVs.length === 0 ? (
              <div className="p-4 text-gray-500 text-center text-xs border border-gray-200 rounded-md">
                Nie masz żadnych zapisanych CV.
              </div>
            ) : (
              userCVs.map((cv) => (
                <div 
                  key={cv.id} 
                  className={`border ${selectedUserCV === cv.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'} 
                    rounded-md p-2 mb-2 cursor-pointer transition-all`}
                  onClick={() => setSelectedUserCV(cv.id)}
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-xs">{cv.name}</h3>
                        {cv.job_offer_id && (
                          <span className="text-[10px] text-gray-500">
                            Dopasowane do oferty
                          </span>
                        )}
                      </div>
                      {selectedUserCV === cv.id && (
                        <span className="text-purple-500 text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wybór oferty - prawa kolumna */}
        <div>
          <h3 className="text-sm font-medium mb-2">Oferty pracy</h3>
          
          {/* Pole wyszukiwania ofert */}
          <div className="relative mb-2">
            <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              type="text" 
              placeholder="Szukaj ofert..." 
              className="pl-8 pr-2 py-1 text-xs h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(23vh)' }}>
            {filteredOffers.length === 0 ? (
              <div className="p-4 text-gray-500 text-center text-xs border border-gray-200 rounded-md">
                {searchQuery.trim() !== '' ? 'Nie znaleziono ofert pasujących do wyszukiwania' : 'Nie znaleziono ofert pracy'}
              </div>
            ) : (
              filteredOffers.map(offer => (
                <div 
                  key={offer.id} 
                  className={`border ${selectedJobOffer === offer.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'} 
                    rounded-md p-2 mb-2 cursor-pointer transition-all`}
                  onClick={() => setSelectedJobOffer(offer.id)}
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-xs">{offer.title}</h3>
                        <p className="text-[10px] text-gray-600">{offer.company}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${getStatusStyles(offer.status || 'saved')}`}>
                          {statusMap[offer.status || 'saved'] || offer.status || 'zapisana'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Dodatkowe informacje */}
      <div>
        <Label htmlFor="additional-info" className="flex items-center gap-2 mb-2">
          <InfoIcon size={16} />
          Dodatkowe informacje
        </Label>
        <Textarea 
          id="additional-info" 
          placeholder="Podaj dodatkowe informacje, które powinny zostać uwzględnione w wiadomości..." 
          className="min-h-[85px]"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
        />
      </div>
      
      {/* Przycisk generowania */}
      <Button 
        onClick={generateText} 
        className={`w-full px-4 py-2 rounded-md transition ${
          selectedJobOffer && selectedUserCV && !isGenerating
            ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={isGenerating || !selectedJobOffer || !selectedUserCV}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            <span>Generowanie wiadomości...</span>
          </div>
        ) : (
          'Generuj wiadomość'
        )}
      </Button>
      
      {/* Zapisane szablony */}
      {savedTemplates.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded">
          <p className="text-xs text-blue-700 mb-2 font-medium">
            Zapisane szablony
          </p>
          <div className="space-y-2">
            {savedTemplates.map((template) => (
              <div key={template.id} className="flex items-center gap-2 p-2 border border-blue-200 rounded-md bg-white">
                <span className="flex-1 truncate text-xs">{template.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => loadTemplate(template.id)}
                >
                  Wczytaj
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
} 