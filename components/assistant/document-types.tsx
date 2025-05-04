"use client";

import { DocumentType, DocumentConfig } from "@/components/assistant/types";
import { FileText, MessageCircle, CheckCircle, Clock, HelpCircle, MessageSquareQuote, Heart } from "lucide-react";

// Konfiguracja dokumentów
const documentConfig: DocumentConfig[] = [
  { 
    id: "hr_message", 
    title: "Wiadomość do HR", 
    description: "Wiadomość do rekrutera/działu HR",
    icon: <MessageCircle className="h-6 w-6" />,
    color: "border-blue-500 bg-blue-50 hover:bg-blue-100"
  },
  { 
    id: "welcome_message", 
    title: "Wiadomość powitalna", 
    description: "Spersonalizowana wiadomość powitalna",
    icon: <FileText className="h-6 w-6" />,
    color: "border-green-500 bg-green-50 hover:bg-green-100"
  },
  { 
    id: "status_inquiry", 
    title: "Pytanie o status", 
    description: "Zapytanie o status rekrutacji",
    icon: <Clock className="h-6 w-6" />,
    color: "border-yellow-500 bg-yellow-50 hover:bg-yellow-100"
  },
  { 
    id: "thank_you", 
    title: "Podziękowanie", 
    description: "Podziękowanie po rozmowie kwalifikacyjnej",
    icon: <Heart className="h-6 w-6" />,
    color: "border-pink-500 bg-pink-50 hover:bg-pink-100"
  },
  { 
    id: "feedback_request", 
    title: "Prośba o feedback", 
    description: "Prośba o feedback po procesie rekrutacyjnym",
    icon: <MessageSquareQuote className="h-6 w-6" />,
    color: "border-purple-500 bg-purple-50 hover:bg-purple-100"
  },
  { 
    id: "clarification_request", 
    title: "Prośba o doprecyzowanie", 
    description: "Prośba o więcej informacji o ofercie",
    icon: <HelpCircle className="h-6 w-6" />,
    color: "border-indigo-500 bg-indigo-50 hover:bg-indigo-100"
  },
  { 
    id: "team_welcome", 
    title: "Wiadomość do zespołu", 
    description: "Wiadomość powitalna do przyszłego zespołu",
    icon: <CheckCircle className="h-6 w-6" />,
    color: "border-teal-500 bg-teal-50 hover:bg-teal-100"
  }
];

interface DocumentTypesProps {
  selectedDocument: DocumentType;
  setSelectedDocument: (type: DocumentType) => void;
}

export function DocumentTypes({
  selectedDocument,
  setSelectedDocument,
}: DocumentTypesProps) {
  return (
    <div className="space-y-0">
    
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {documentConfig.map((doc) => (
          <div
            key={doc.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedDocument === doc.id 
                ? doc.color + " border-opacity-100" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            onClick={() => setSelectedDocument(doc.id as DocumentType)}
          >
            <div className="flex items-start space-x-3">
              <div className={`mt-0.5 ${selectedDocument === doc.id ? "text-gray-800" : "text-gray-500"}`}>
                {doc.icon}
              </div>
              <div>
                <h3 className="font-medium">{doc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 