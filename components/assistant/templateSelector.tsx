"use client";

import React from 'react';
import { useAssistant, documentTemplates } from './assistantContext';

export default function TemplateSelector() {
  const { selectedTemplate, setSelectedTemplate } = useAssistant();

  return (
    <div className="w-full mb-8 mt-6">
      {/* Karty szablonów w układzie siatki */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {documentTemplates.map((template) => (
          <div 
            key={template.id}
            className={`
              p-4 rounded-sm 
              bg-white 
              shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              cursor-pointer transition-all
              ${
                selectedTemplate === template.id 
                  ? `border-t-[6px] ${template.color || 'border-gray-400'} bg-muted/20` 
                  : `border-gray-200 border-t-[1px] ${template.color || 'border-t-gray-400'} hover:border-gray-300 hover:shadow-lg`
              }
            `}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium">{template.name}</h3>
              <span className="text-2xl">{template.icon || '📝'}</span>
            </div>
            <p className="text-xs text-gray-500">
              {template.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 