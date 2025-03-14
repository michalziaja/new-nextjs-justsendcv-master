// components/drawer-sections/JobDescription.tsx
import { mockApplications } from "../saved/mockData"
import { useState, useEffect } from "react"

interface KeywordWithCategory {
  keyword: string
  category: 'industrySkills' | 'softSkills' | 'requirements' | 'benefits' | 'generalJobTerms'
}

interface JobDescriptionProps {
  application: typeof mockApplications[0]
  isDesktop: boolean
  keywords?: KeywordWithCategory[]
}

export function JobDescription({ application, isDesktop, keywords = [] }: JobDescriptionProps) {
  const [highlightedText, setHighlightedText] = useState(application?.description || '')

  // Funkcja zwracająca klasę CSS dla danej kategorii
  const getCategoryStyle = (category: KeywordWithCategory['category']) => {
    switch (category) {
      case 'industrySkills':
        return 'bg-blue-100 dark:bg-blue-900/50'
      case 'softSkills':
        return 'bg-green-100 dark:bg-green-900/50'
      case 'requirements':
        return 'bg-yellow-100 dark:bg-yellow-900/50'
      case 'benefits':
        return 'bg-purple-100 dark:bg-purple-900/50'
      case 'generalJobTerms':
        return 'bg-gray-100 dark:bg-gray-900/50'
      default:
        return 'bg-gray-100 dark:bg-gray-800/50'
    }
  }

  // Funkcja do podświetlania słów kluczowych
  const highlightKeywords = (text: string, keywords: KeywordWithCategory[]) => {
    if (!keywords.length) return text

    let result = text
    // Sortujemy słowa kluczowe od najdłuższych do najkrótszych, aby uniknąć częściowych zamian
    const sortedKeywords = [...keywords].sort((a, b) => b.keyword.length - a.keyword.length)

    sortedKeywords.forEach(({ keyword, category }) => {
      const pattern = new RegExp(`\\b(${keyword})\\b`, 'gi')
      const style = getCategoryStyle(category)
      result = result.replace(pattern, `<span class="${style} rounded px-1">$1</span>`)
    })

    return result
  }

  useEffect(() => {
    if (application?.description) {
      const highlighted = highlightKeywords(application.description, keywords)
      setHighlightedText(highlighted)
    }
  }, [application, keywords])

  return (
    <div className="h-full">
      {/* <h3 className="font-medium text-sm text-muted-foreground mb-2">Opis stanowiska</h3> */}
      <div className="rounded-lg h-[calc(100%-2rem)] w-[calc(95%+2.5rem)]">
        <div 
          className="p-1 h-full overflow-y-auto whitespace-pre-line text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedText }}
        />
      </div>
    </div>
  )
} 