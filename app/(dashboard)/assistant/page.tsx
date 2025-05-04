"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentTypes } from "@/components/assistant/document-types";
import { JobAndCVSelector } from "@/components/assistant/job-and-cv-selector";
import { DocumentEditor } from "@/components/assistant/document-editor";
import { DocumentType, JobOffer, CV } from "@/components/assistant/types";
import { generateDocument } from "@/components/assistant/document-generator";

export default function AssistantPage() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>("hr_message");
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(null);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDocument = async () => {
    if (!selectedJobOffer) {
      alert("Proszę wybrać ofertę pracy");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Symulacja opóźnienia dla lepszego UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      const documentText = generateDocument(selectedDocument, selectedJobOffer);
      setGeneratedDocument(documentText);
    } catch (error) {
      console.error("Błąd podczas generowania dokumentu:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4">

      
      {/* Główny kontener */}
      <div className="space-y-8">
        {/* Sekcja wyboru dokumentu */}
        <Card>
          <CardContent className="pt-0">
            <DocumentTypes 
              selectedDocument={selectedDocument}
              setSelectedDocument={setSelectedDocument}
            />
          </CardContent>
        </Card>
        
        {/* Sekcja wyboru CV/oferty i podglądu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lewa kolumna - wybór CV i oferty */}
          <Card>
            <CardContent className="pt-0">
              <JobAndCVSelector
                selectedJobOffer={selectedJobOffer}
                selectedCV={selectedCV}
                setSelectedJobOffer={setSelectedJobOffer}
                setSelectedCV={setSelectedCV}
                onGenerateDocument={handleGenerateDocument}
                isGenerating={isGenerating}
              />
            </CardContent>
          </Card>
          
          {/* Prawa kolumna - podgląd dokumentu */}
          <Card>
            <CardContent className="pt-0">
              <DocumentEditor
                value={generatedDocument}
                onChange={setGeneratedDocument}
                isGenerating={isGenerating}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
