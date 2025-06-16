"use client";

import React from 'react';
import { useAssistant, documentTemplates } from './assistantContext';
import { FileText, Clock, ThumbsUp, MessageSquare, FileQuestion, UserCheck, FileEdit, Send } from "lucide-react";

export default function TemplateSelector() {
  const { selectedTemplate, setSelectedTemplate } = useAssistant();

  // Funkcja zwracająca odpowiednią ikonę na podstawie id szablonu
  const getTemplateIcon = (templateId: string) => {
    switch(templateId) {
      case 'greeting':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'followup':
        return <Clock className="h-6 w-6 text-amber-500" />;
      case 'thank-you':
        return <ThumbsUp className="h-6 w-6 text-green-500" />;
      case 'feedback':
        return <MessageSquare className="h-6 w-6 text-orange-500" />;
      case 'clarification':
        return <FileQuestion className="h-6 w-6 text-purple-500" />;
      case 'welcome':
        return <UserCheck className="h-6 w-6 text-cyan-500" />;
      case 'linkedin-footer':
        return <FileEdit className="h-6 w-6 text-indigo-500" />;
      case 'direct-recruiter':
        return <Send className="h-6 w-6 text-pink-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      {/* Karty szablonów w układzie siatki */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {documentTemplates.map((template, index) => {
          // Logika zaokrągleń dla zewnętrznych narożników siatki
          let roundedClasses = '';
          
          // Mobile (2 kolumny): index 0=górny lewy, 1=górny prawy, 6=dolny lewy, 7=dolny prawy
          // Desktop (4 kolumny): index 0=górny lewy, 3=górny prawy, 4=dolny lewy, 7=dolny prawy
          
          if (index === 0) {
            roundedClasses = 'rounded-tl-sm'; // Górny lewy zawsze
          } else if (index === 1) {
            roundedClasses = 'md:rounded-none rounded-tr-sm'; // Górny prawy tylko na mobile
          } else if (index === 3) {
            roundedClasses = 'md:rounded-tr-sm'; // Górny prawy tylko na desktop
          } else if (index === 4) {
            roundedClasses = 'md:rounded-bl-sm'; // Dolny lewy tylko na desktop
          } else if (index === 6) {
            roundedClasses = 'md:rounded-none rounded-bl-sm'; // Dolny lewy tylko na mobile
          } else if (index === 7) {
            roundedClasses = 'rounded-br-sm'; // Dolny prawy zawsze
          } else {
            roundedClasses = 'rounded-none';
          }

          return (
            <div 
              key={template.id}
              className={`
                p-4 
                ${roundedClasses}
                bg-white dark:bg-sidebar 
                shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
                cursor-pointer transition-all
                border-t-[6px]
                ${
                  selectedTemplate === template.id 
                    ? `${template.color || 'border-gray-400'} bg-muted/20` 
                    : `border-transparent hover:border-gray-300 hover:shadow-lg`
                }
              `}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{template.name}</h3>
                {getTemplateIcon(template.id)}
              </div>
              <p className="text-xs text-gray-500">
                {template.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
} 