"use client"

import { useState, useEffect } from "react"
import nlp from 'compromise'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { JobOffer } from "../saved/ApplicationDetailsDrawer"
import { extendNLP, KEYWORDS_CATEGORIES, KeywordMatch, KeywordCategory } from "@/lib/keywords-dictionary"

// Inicjalizacja rozszerzenia NLP przy pierwszym ładowaniu komponentu
extendNLP()

interface JobAnalysisProps {
  application: JobOffer
  isDesktop: boolean
  onKeywordsFound?: (keywords: Array<{ keyword: string, category: KeywordCategory }>) => void
}

export function JobAnalysis({ application, isDesktop, onKeywordsFound }: JobAnalysisProps) {
  const [keywordMatches, setKeywordMatches] = useState<KeywordMatch[]>([])
  const [analysisScore, setAnalysisScore] = useState<number>(0)
  const [cvSuggestions, setCvSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!application?.full_description) {
      return
    }

    const description = application.full_description.toLowerCase()
    const doc = nlp(description)
    const matches: KeywordMatch[] = []
    let totalScore = 0
    const suggestions: string[] = []
    const foundKeywords: Array<{ keyword: string, category: KeywordCategory }> = []

    const sentences = doc.sentences().out('array')
    const terms = doc.terms().out('array')
    const nouns = doc.nouns().out('array')
    const adjectives = doc.adjectives().out('array')

    Object.entries(KEYWORDS_CATEGORIES).forEach(([category, { keywords, weight }]) => {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        const exactMatches = (description.match(regex) || []).length

        if (exactMatches > 0) {
          foundKeywords.push({
            keyword,
            category: category as KeywordCategory
          })
          const context = sentences.filter((sentence: string) =>
            sentence.toLowerCase().includes(keyword)
          ).slice(0, 2)

          const isRequired = context.some((sentence: string) =>
            sentence.includes('wymagane') || 
            sentence.includes('wymagania') || 
            sentence.includes('obowiązkowe') || 
            sentence.includes('musi') ||
            sentence.includes('min.') ||
            sentence.includes('required') ||
            sentence.includes('mandatory') ||
            !sentence.includes('mile widziane') &&
            !sentence.includes('preferred')
          )

          const contextScore = nouns.includes(keyword) ? 1.2 : 
                              adjectives.includes(keyword) ? 1.1 : 1.0
          const requirementScore = isRequired ? 1.5 : 1.0
          const score = exactMatches * weight * contextScore * requirementScore

          totalScore += score

          matches.push({
            category: category as KeywordCategory,
            keyword,
            count: exactMatches,
            score,
            context,
            isRequired
          })

          if (category === 'industrySkills' || category === 'requirements') {
            suggestions.push(
              isRequired 
                ? `Podkreśl doświadczenie w: ${keyword} (wymagane/required)`
                : `Rozważ dodanie: ${keyword} (mile widziane/preferred)`
            )
          }
        }
      })
    })

    matches.sort((a, b) => b.score - a.score)
    setKeywordMatches(matches.slice(0, 20))
    setAnalysisScore(totalScore)
    setCvSuggestions(suggestions.slice(0, 5))
    
    // Przekazanie znalezionych słów kluczowych wraz z kategoriami
    if (onKeywordsFound) {
      onKeywordsFound(foundKeywords)
    }
  }, [application, onKeywordsFound])

  const getCategoryColor = (category: KeywordCategory) => {
    switch (category) {
      case 'industrySkills': return 'bg-blue-100 text-blue-800'
      case 'softSkills': return 'bg-green-100 text-green-800'
      case 'requirements': return 'bg-yellow-100 text-yellow-800'
      case 'benefits': return 'bg-purple-100 text-purple-800'
      case 'generalJobTerms': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="h-full">
      {/* <h3 className="font-medium text-sm text-muted-foreground mb-2">Analiza ogłoszenia</h3> */}
      <ScrollArea className="rounded-lg p-0 h-[calc(100%-2rem)]">
        {keywordMatches.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-md font-medium">Wynik analizy:</span>
              <Badge variant="secondary" className={cn(
                analysisScore > 20 ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900',
                'mr-4'
              )}>
                {analysisScore.toFixed(1)} pkt
              </Badge>
            </div>
            <div className="flex justify-center w-full">
              <div className="w-[100%] mr-4 h-px bg-border"></div>
            </div>
            {Object.keys(KEYWORDS_CATEGORIES).map((category) => {
              const categoryMatches = keywordMatches.filter(
                match => match.category === category
              )
              if (categoryMatches.length === 0) return null

              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium">
                    {KEYWORDS_CATEGORIES[category as KeywordCategory].label}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryMatches.map((match, index) => (
                      <Badge
                        key={`${match.keyword}-${index}`}
                        variant="outline"
                        className={cn(
                          getCategoryColor(match.category),
                          match.isRequired && 'border-2 border-dashed',
                          'cursor-help'
                        )}
                        title={`Kontekst: ${match.context.join(' | ')}`}
                      >
                        {match.keyword} ({match.count})
                        {match.isRequired && <span className="ml-1 text-xs">*</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}

            {cvSuggestions.length > 0 && (
              <>
                <div className="flex justify-center w-full">
                  <div className="w-full mr-4 h-px bg-border"></div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sugestie do CV:</h4>
                  <ul className="list-disc pl-4 text-sm text-muted-foreground">
                    {cvSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Brak treści do analizy
          </div>
        )}
      </ScrollArea>
    </div>
  )
}