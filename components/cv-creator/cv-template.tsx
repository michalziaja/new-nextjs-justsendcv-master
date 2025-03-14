"use client"

import { cn } from "@/lib/utils"

type CVData = {
  personal: {
    firstName: string
    lastName: string
    position: string
    email: string
    phone: string
    city: string
    country: string
    summary: string
  }
  experience: {
    title: string
    company: string
    startDate: string
    endDate: string
    description: string
  }[]
}

type CVTemplateProps = {
  cvData: CVData
  selectedTemplate: string
  selectedColor: string
}

export function CVTemplate({ cvData, selectedTemplate, selectedColor }: CVTemplateProps) {
  const getColorClassName = (type: "bg" | "text" | "border") => `${type}-${selectedColor}-500`

  const ProfessionalTemplate = () => (
    <div className="w-full h-full bg-white text-black font-sans text-[10px] leading-tight p-6">
      <div className={cn("h-12 w-full mb-4", getColorClassName("bg"))}></div>
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{cvData.personal.firstName} {cvData.personal.lastName}</h1>
          <p className="text-sm">{cvData.personal.position}</p>
        </div>
        <div className="text-right">
          <p>{cvData.personal.email}</p>
          <p>{cvData.personal.phone}</p>
          <p>{cvData.personal.city}, {cvData.personal.country}</p>
        </div>
      </div>
      <div className="mb-4">
        <h2 className={cn("text-sm font-semibold border-b pb-1 mb-2", getColorClassName("text"), getColorClassName("border"))}>
          Podsumowanie
        </h2>
        <p>{cvData.personal.summary}</p>
      </div>
      <div>
        <h2 className={cn("text-sm font-semibold border-b pb-1 mb-2", getColorClassName("text"), getColorClassName("border"))}>
          Doświadczenie
        </h2>
        {cvData.experience.map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between">
              <p className="font-semibold">{exp.title}</p>
              <p className="text-gray-600">{exp.startDate} - {exp.endDate}</p>
            </div>
            <p className="italic text-gray-700">{exp.company}</p>
            <p className="mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const ModernTemplate = () => (
    <div className="w-full h-full bg-white text-black font-sans text-[10px] leading-tight flex">
      <div className={cn("w-1/3 h-full p-4 text-white", getColorClassName("bg"))}>
        <h1 className="text-lg font-bold">{cvData.personal.firstName} {cvData.personal.lastName}</h1>
        <p className="text-xs mb-4">{cvData.personal.position}</p>
        <div>
          <p>{cvData.personal.email}</p>
          <p>{cvData.personal.phone}</p>
          <p>{cvData.personal.city}, {cvData.personal.country}</p>
        </div>
      </div>
      <div className="w-2/3 p-6">
        <div className="mb-4">
          <h2 className={cn("text-sm font-semibold border-b pb-1 mb-2", getColorClassName("text"), getColorClassName("border"))}>
            Podsumowanie
          </h2>
          <p>{cvData.personal.summary}</p>
        </div>
        <div>
          <h2 className={cn("text-sm font-semibold border-b pb-1 mb-2", getColorClassName("text"), getColorClassName("border"))}>
            Doświadczenie
          </h2>
          {cvData.experience.map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <p className="font-semibold">{exp.title}</p>
                <p className="text-gray-600">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="italic text-gray-700">{exp.company}</p>
              <p className="mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const MinimalTemplate = () => (
    <div className="w-full h-full bg-white text-black font-sans text-[10px] leading-tight p-6">
      <h1 className={cn("text-xl font-bold mb-1", getColorClassName("text"))}>
        {cvData.personal.firstName} {cvData.personal.lastName}
      </h1>
      <p className="text-sm mb-2">{cvData.personal.position}</p>
      <p className="text-gray-700 mb-4">
        {cvData.personal.email} | {cvData.personal.phone} | {cvData.personal.city}, {cvData.personal.country}
      </p>
      <div className="mb-4">
        <h2 className={cn("text-sm font-semibold mb-2", getColorClassName("text"))}>Podsumowanie</h2>
        <p>{cvData.personal.summary}</p>
      </div>
      <div>
        <h2 className={cn("text-sm font-semibold mb-2", getColorClassName("text"))}>Doświadczenie</h2>
        {cvData.experience.map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between">
              <p className="font-semibold">{exp.title}</p>
              <p className="text-gray-600">{exp.startDate} - {exp.endDate}</p>
            </div>
            <p className="italic text-gray-700">{exp.company}</p>
            <p className="mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const PhotoTemplate = () => (
    <div className="w-full h-full bg-white text-black font-sans text-[10px] leading-tight p-6">
      <div className="flex items-start mb-4">
        <div className={cn("w-24 h-24 rounded-full mr-4", getColorClassName("bg"))}></div> {/* Placeholder na zdjęcie */}
        <div className="flex-1">
          <h1 className="text-xl font-bold">{cvData.personal.firstName} {cvData.personal.lastName}</h1>
          <p className="text-sm mb-2">{cvData.personal.position}</p>
          <p className="text-gray-700">
            {cvData.personal.email} | {cvData.personal.phone} | {cvData.personal.city}, {cvData.personal.country}
          </p>
        </div>
      </div>
      <div className="mb-4">
        <h2 className={cn("text-sm font-semibold border-b pb-1 mb-2", getColorClassName("text"), getColorClassName("border"))}>
          Podsumowanie
        </h2>
        <p>{cvData.personal.summary}</p>
      </div>
      <div>
        <h2 className={cn("text-sm font-semibold border-b pb-1 mb-2", getColorClassName("text"), getColorClassName("border"))}>
          Doświadczenie
        </h2>
        {cvData.experience.map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between">
              <p className="font-semibold">{exp.title}</p>
              <p className="text-gray-600">{exp.startDate} - {exp.endDate}</p>
            </div>
            <p className="italic text-gray-700">{exp.company}</p>
            <p className="mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div
      className="w-full max-w-[210mm] border-2 bg-white rounded-lg shadow-lg overflow-hidden"
      style={{
        aspectRatio: "210 / 297", // Proporcje A4
      }}
    >
      {selectedTemplate === "professional" && <ProfessionalTemplate />}
      {selectedTemplate === "modern" && <ModernTemplate />}
      {selectedTemplate === "minimal" && <MinimalTemplate />}
      {selectedTemplate === "photo" && <PhotoTemplate />}
    </div>
  )
}