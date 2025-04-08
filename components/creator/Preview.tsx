"use client";

import React from 'react';
import { Application } from '@/components/saved/mockData';
import { useCV, CVData } from './CVContext';

// Komponent dla podglądu CV w szablonie nowoczesnym
const ModernTemplate: React.FC<{ data: CVData; selectedJob?: Application | null }> = ({ data, selectedJob }) => {
  return (
    <div className="p-6 h-full font-sans text-sm">
      {/* Nagłówek z danymi osobowymi */}
      <div className="border-b-2 border-blue-500 pb-4">
        <h1 className="text-2xl font-bold">{data.personalData.firstName} {data.personalData.lastName}</h1>
        <div className="text-gray-700 mt-2 grid grid-cols-2 gap-1">
          <div>Email: {data.personalData.email}</div>
          <div>Telefon: {data.personalData.phone}</div>
          <div className="col-span-2">Adres: {data.personalData.address}</div>
        </div>
        {selectedJob && (
          <div className="mt-2 text-blue-600 font-medium">
            Aplikacja na stanowisko: {selectedJob.position} w {selectedJob.company}
          </div>
        )}
      </div>
      
      {/* Doświadczenie */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-1">Doświadczenie zawodowe</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mt-3">
            <div className="flex justify-between">
              <div className="font-medium">{exp.position}</div>
              <div className="text-gray-600 text-xs">
                {exp.startDate && formatDate(exp.startDate)} - {exp.endDate && formatDate(exp.endDate)}
              </div>
            </div>
            <div className="text-gray-700">{exp.company}</div>
            <div className="mt-1 text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
      
      {/* Wykształcenie */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-1">Wykształcenie</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mt-3">
            <div className="flex justify-between">
              <div className="font-medium">{edu.school}</div>
              <div className="text-gray-600 text-xs">
                {edu.startDate && formatDate(edu.startDate)} - {edu.endDate && formatDate(edu.endDate)}
              </div>
            </div>
            <div className="text-gray-700">{edu.degree}</div>
            <div className="mt-1 text-xs">{edu.description}</div>
          </div>
        ))}
      </div>
      
      {/* Umiejętności */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-1">Umiejętności</h2>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <h3 className="font-medium text-gray-800">Techniczne</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {data.skills.technical.map((skill, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Miękkie</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {data.skills.soft.map((skill, index) => (
                <span key={index} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <h3 className="font-medium text-gray-800">Języki obce</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {data.skills.languages.filter(lang => lang.language && lang.level).map((lang, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <span className="font-medium">{lang.language}:</span>
                <span className="bg-gray-100 px-1 rounded">{lang.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Funkcja pomocnicza do formatowania daty
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  } catch (e) {
    return dateString;
  }
};

// Komponent klasyczny
const ClassicTemplate: React.FC<{ data: CVData; selectedJob?: Application | null }> = ({ data, selectedJob }) => {
  return (
    <div className="p-6 h-full font-serif text-sm">
      {/* Nagłówek z danymi osobowymi */}
      <div className="text-center pb-4 border-b border-gray-300">
        <h1 className="text-xl font-bold uppercase tracking-wider">{data.personalData.firstName} {data.personalData.lastName}</h1>
        <div className="text-gray-700 mt-2">
          <div>{data.personalData.email} • {data.personalData.phone}</div>
          <div>{data.personalData.address}</div>
        </div>
        {selectedJob && (
          <div className="mt-2 font-medium">
            Aplikacja na stanowisko: {selectedJob.position} w {selectedJob.company}
          </div>
        )}
      </div>
      
      {/* Doświadczenie */}
      <div className="mt-4">
        <h2 className="font-bold uppercase tracking-wider text-center mb-2">Doświadczenie zawodowe</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mt-3">
            <div className="flex justify-between font-medium">
              <div>{exp.position}, {exp.company}</div>
              <div className="text-gray-600">
                {exp.startDate && formatDate(exp.startDate)} - {exp.endDate && formatDate(exp.endDate)}
              </div>
            </div>
            <div className="mt-1 text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
      
      {/* Wykształcenie */}
      <div className="mt-4">
        <h2 className="font-bold uppercase tracking-wider text-center mb-2">Wykształcenie</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mt-3">
            <div className="flex justify-between font-medium">
              <div>{edu.degree}, {edu.school}</div>
              <div className="text-gray-600">
                {edu.startDate && formatDate(edu.startDate)} - {edu.endDate && formatDate(edu.endDate)}
              </div>
            </div>
            <div className="mt-1 text-xs">{edu.description}</div>
          </div>
        ))}
      </div>
      
      {/* Umiejętności */}
      <div className="mt-4">
        <h2 className="font-bold uppercase tracking-wider text-center mb-2">Umiejętności</h2>
        
        <div className="mt-2">
          <h3 className="font-medium">Techniczne:</h3>
          <p>{data.skills.technical.join(', ')}</p>
        </div>
        
        <div className="mt-2">
          <h3 className="font-medium">Miękkie:</h3>
          <p>{data.skills.soft.join(', ')}</p>
        </div>
        
        <div className="mt-2">
          <h3 className="font-medium">Języki obce:</h3>
          <p>
            {data.skills.languages
              .filter(lang => lang.language && lang.level)
              .map(lang => `${lang.language} (${lang.level})`)
              .join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Komponent kreatywny
const CreativeTemplate: React.FC<{ data: CVData; selectedJob?: Application | null }> = ({ data, selectedJob }) => {
  return (
    <div className="p-6 h-full font-sans text-sm bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Nagłówek z danymi osobowymi */}
      <div className="relative pb-6 mb-6">
        <div className="absolute top-0 left-0 w-16 h-16 bg-purple-400 rounded-full opacity-20"></div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-blue-400 rounded-full opacity-10"></div>
        
        <h1 className="text-3xl font-bold text-purple-800 relative z-10">
          {data.personalData.firstName} <span className="text-blue-600">{data.personalData.lastName}</span>
        </h1>
        
        <div className="mt-4 flex flex-wrap gap-3 relative z-10">
          {data.personalData.email && (
            <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs flex items-center">
              <span className="mr-1">✉️</span> {data.personalData.email}
            </div>
          )}
          {data.personalData.phone && (
            <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs flex items-center">
              <span className="mr-1">📱</span> {data.personalData.phone}
            </div>
          )}
          {data.personalData.address && (
            <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs flex items-center">
              <span className="mr-1">🏠</span> {data.personalData.address}
            </div>
          )}
        </div>
        
        {selectedJob && (
          <div className="mt-3 bg-purple-100 border border-purple-200 p-2 rounded-lg text-sm relative z-10">
            <span className="font-medium text-purple-700">Aplikacja na stanowisko:</span> 
            <span className="text-blue-600 font-bold"> {selectedJob.position}</span> w {selectedJob.company}
          </div>
        )}
      </div>
      
      {/* Doświadczenie */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-purple-800 relative">
          <span className="relative z-10">Doświadczenie zawodowe</span>
          <span className="absolute bottom-0 left-0 h-3 w-24 bg-purple-200 opacity-50"></span>
        </h2>
        
        <div className="mt-3 space-y-4">
          {data.experience.map((exp, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex justify-between">
                <div className="font-medium text-blue-700">{exp.position}</div>
                <div className="text-gray-500 text-xs">
                  {exp.startDate && formatDate(exp.startDate)} - {exp.endDate && formatDate(exp.endDate)}
                </div>
              </div>
              <div className="text-gray-700 font-medium">{exp.company}</div>
              <div className="mt-2 text-xs text-gray-600">{exp.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Wykształcenie */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-purple-800 relative">
          <span className="relative z-10">Wykształcenie</span>
          <span className="absolute bottom-0 left-0 h-3 w-24 bg-purple-200 opacity-50"></span>
        </h2>
        
        <div className="mt-3 space-y-4">
          {data.education.map((edu, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex justify-between">
                <div className="font-medium text-blue-700">{edu.degree}</div>
                <div className="text-gray-500 text-xs">
                  {edu.startDate && formatDate(edu.startDate)} - {edu.endDate && formatDate(edu.endDate)}
                </div>
              </div>
              <div className="text-gray-700 font-medium">{edu.school}</div>
              <div className="mt-2 text-xs text-gray-600">{edu.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Umiejętności */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-purple-800 relative">
          <span className="relative z-10">Umiejętności</span>
          <span className="absolute bottom-0 left-0 h-3 w-24 bg-purple-200 opacity-50"></span>
        </h2>
        
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">Techniczne</h3>
            <div className="flex flex-wrap gap-1">
              {data.skills.technical.map((skill, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">Miękkie</h3>
            <div className="flex flex-wrap gap-1">
              {data.skills.soft.map((skill, index) => (
                <span key={index} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-3 bg-white p-3 rounded-lg shadow-sm">
          <h3 className="font-medium text-blue-700 mb-2">Języki obce</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.languages.filter(lang => lang.language && lang.level).map((lang, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 rounded-full text-xs flex items-center">
                <span className="font-medium">{lang.language}:</span>
                <span className="ml-1 bg-white px-1 rounded-full">{lang.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponent dla prawej strony - podgląd
export default function Preview() {
  const { cvData, selectedJob, selectedTemplate } = useCV();

  // Funkcja renderująca odpowiedni szablon
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'klasyczny':
        return <ClassicTemplate data={cvData} selectedJob={selectedJob} />;
      case 'kreatywny':
        return <CreativeTemplate data={cvData} selectedJob={selectedJob} />;
      case 'nowoczesny':
      default:
        return <ModernTemplate data={cvData} selectedJob={selectedJob} />;
    }
  };

  return (
    <div className="h-full bg-white p-6 rounded-lg shadow-lg">
      
      <div className="border rounded-lg  bg-gray-50 overflow-y-auto">
        {renderTemplate()}
      </div>
    </div>
  );
};