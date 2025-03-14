"use client"

import { mockApplications } from "../saved/mockData"
import { useState, useEffect } from "react"
import nlp from 'compromise'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Rozszerzenie NLP dla języka polskiego i angielskiego
nlp.extend({
  words: {
    // Polski - rzeczowniki
    doświadczenie: 'Noun', umiejętność: 'Noun', znajomość: 'Noun', praca: 'Noun', zespół: 'Noun', 
    rozwój: 'Noun', projekt: 'Noun', programowanie: 'Noun', analiza: 'Noun', zarządzanie: 'Noun',
    komunikacja: 'Noun', kreatywność: 'Noun', liderstwo: 'Noun', certyfikat: 'Noun', wykształcenie: 'Noun', 
    benefity: 'Noun', premia: 'Noun', stabilność: 'Noun', sprzedaż: 'Noun', marketing: 'Noun', 
    obsługa: 'Noun', administracja: 'Noun', produkcja: 'Noun', finanse: 'Noun', logistyka: 'Noun', 
    edukacja: 'Noun', zdrowie: 'Noun', klient: 'Noun', jakość: 'Noun', bezpieczeństwo: 'Noun',
    kompetencja: 'Noun', stawka: 'Noun', pensja: 'Noun', wynagrodzenie: 'Noun', umowa: 'Noun',
    specjalista: 'Noun', ekspert: 'Noun', asystent: 'Noun', kierownik: 'Noun', menedżer: 'Noun',
    dyrektor: 'Noun', koordynator: 'Noun', konsultant: 'Noun', doradca: 'Noun', przedstawiciel: 'Noun',
    analityk: 'Noun', inżynier: 'Noun', technolog: 'Noun', mechanik: 'Noun', elektryk: 'Noun',
    handlowiec: 'Noun', księgowy: 'Noun', prawnik: 'Noun', rekruter: 'Noun', specjalizacja: 'Noun',
    technologia: 'Noun', narzędzie: 'Noun', system: 'Noun', urządzenie: 'Noun', maszyna: 'Noun',
    platforma: 'Noun', oprogramowanie: 'Noun', aplikacja: 'Noun', metodologia: 'Noun', proces: 'Noun',
    kwalifikacja: 'Noun', uprawnienie: 'Noun', etat: 'Noun', urlop: 'Noun', szkolenie: 'Noun',
    kurs: 'Noun', wymaganie: 'Noun', zadanie: 'Noun', obowiązek: 'Noun', stanowisko: 'Noun',
    transport: 'Noun', turystyka: 'Noun', hotelarstwo: 'Noun', gastronomia: 'Noun', rolnictwo: 'Noun',
    budownictwo: 'Noun', nieruchomość: 'Noun', farmacja: 'Noun', energetyka: 'Noun', górnictwo: 'Noun',
    przemysł: 'Noun', handel: 'Noun', ubezpieczenie: 'Noun', telekomunikacja: 'Noun', media: 'Noun',
    kultura: 'Noun', sztuka: 'Noun', nauka: 'Noun', badanie: 'Noun', prawo: 'Noun',
    tłumaczenie: 'Noun', rekrutacja: 'Noun', HR: 'Noun', PublicRelations: 'Noun',

    // Polski - przymiotniki
    zdalna: 'Adjective', hybrydowa: 'Adjective', elastyczny: 'Adjective', wymagany: 'Adjective',
    zaawansowany: 'Adjective', podstawowy: 'Adjective', profesjonalny: 'Adjective',
    samodzielny: 'Adjective', skuteczny: 'Adjective', dokładny: 'Adjective', obowiązkowy: 'Adjective',
    preferowany: 'Adjective', dodatkowy: 'Adjective', konkurencyjny: 'Adjective', atrakcyjny: 'Adjective',
    stacjonarny: 'Adjective', mobilny: 'Adjective', dynamiczny: 'Adjective', innowacyjny: 'Adjective',
    międzynarodowy: 'Adjective', krajowy: 'Adjective', lokalny: 'Adjective', globalny: 'Adjective',
    pełnoetatowy: 'Adjective', półetatowy: 'Adjective', tymczasowy: 'Adjective', stały: 'Adjective',
    odpowiedzialny: 'Adjective', kreatywny: 'Adjective', komunikatywny: 'Adjective', zorganizowany: 'Adjective',
    zespołowy: 'Adjective', praktyczny: 'Adjective', teoretyczny: 'Adjective', operacyjny: 'Adjective',
    strategiczny: 'Adjective', średni: 'Adjective', wyższy: 'Adjective', kierowniczy: 'Adjective',
    
    // Angielski - rzeczowniki
    experience: 'Noun', skill: 'Noun', knowledge: 'Noun', work: 'Noun', team: 'Noun',
    development: 'Noun', project: 'Noun', programming: 'Noun', analysis: 'Noun', management: 'Noun',
    communication: 'Noun', creativity: 'Noun', leadership: 'Noun', certificate: 'Noun', education: 'Noun',
    benefits: 'Noun', bonus: 'Noun', stability: 'Noun', sales: 'Noun', service: 'Noun', administration: 'Noun', production: 'Noun', finance: 'Noun', logistics: 'Noun',
    health: 'Noun', client: 'Noun', quality: 'Noun', safety: 'Noun',
    competence: 'Noun', rate: 'Noun', salary: 'Noun', wage: 'Noun', contract: 'Noun',
    specialist: 'Noun', expert: 'Noun', assistant: 'Noun', supervisor: 'Noun', manager: 'Noun',
    director: 'Noun', coordinator: 'Noun', consultant: 'Noun', advisor: 'Noun', representative: 'Noun',
    analyst: 'Noun', engineer: 'Noun', technologist: 'Noun', mechanic: 'Noun', electrician: 'Noun',
    salesperson: 'Noun', accountant: 'Noun', lawyer: 'Noun', recruiter: 'Noun', specialization: 'Noun',
    technology: 'Noun', tool: 'Noun', device: 'Noun', machine: 'Noun',
    platform: 'Noun', software: 'Noun', application: 'Noun', methodology: 'Noun', process: 'Noun',
    qualification: 'Noun', certification: 'Noun', position: 'Noun', vacation: 'Noun', training: 'Noun',
    course: 'Noun', requirement: 'Noun', task: 'Noun', duty: 'Noun', transportation: 'Noun', tourism: 'Noun', hospitality: 'Noun', gastronomy: 'Noun', agriculture: 'Noun',
    construction: 'Noun', realestate: 'Noun', pharmacy: 'Noun', energy: 'Noun', mining: 'Noun',
    industry: 'Noun', trade: 'Noun', insurance: 'Noun', telecommunications: 'Noun', culture: 'Noun', art: 'Noun', science: 'Noun', research: 'Noun', law: 'Noun',
    translation: 'Noun', recruitment: 'Noun', support: 'Noun',
    
    // Angielski - przymiotniki
    remote: 'Adjective', hybrid: 'Adjective', flexible: 'Adjective', required: 'Adjective',
    advanced: 'Adjective', basic: 'Adjective', professional: 'Adjective',
    independent: 'Adjective', effective: 'Adjective', accurate: 'Adjective', mandatory: 'Adjective',
    preferred: 'Adjective', additional: 'Adjective', competitive: 'Adjective', attractive: 'Adjective',
    stationary: 'Adjective', mobile: 'Adjective', dynamic: 'Adjective', innovative: 'Adjective',
    international: 'Adjective', national: 'Adjective', local: 'Adjective', global: 'Adjective',
    fulltime: 'Adjective', parttime: 'Adjective', temporary: 'Adjective', permanent: 'Adjective',
    responsible: 'Adjective', creative: 'Adjective', communicative: 'Adjective', organized: 'Adjective',
    teamwork: 'Adjective', practical: 'Adjective', theoretical: 'Adjective', operational: 'Adjective',
    strategic: 'Adjective', middle: 'Adjective', senior: 'Adjective', managerial: 'Adjective'
  }
})

// Rozszerzone kategorie słów kluczowych dla każdej branży w Polsce
const KEYWORDS_CATEGORIES = {
  industrySkills: {
    keywords: [
      // IT i technologie
      'programowanie', 'kodowanie', 'tworzenie oprogramowania', 'development', 'testowanie', 'bazy danych', 
      'analiza danych', 'data analysis', 'sztuczna inteligencja', 'ai', 'machine learning', 'chmura', 'cloud', 
      'cyberbezpieczeństwo', 'cybersecurity', 'sieci', 'networking', 'ux', 'ui', 'web', 'mobile', 'api', 
      'agile', 'scrum', 'git', 'docker', 'aws', 'hashicorp', 'devops', 'jenkins', 'terraform', 'kubernetes', 'excel', 'vba', 'power bi', 'tableau', 'seo', 'cms', 
      'react', 'python', 'java', 'javascript', 'typescript', 'c#', 'php', 'ruby', 'sql', 'linux', 'windows',

      // Finanse i księgowość
      'księgowość', 'accounting', 'rachunkowość', 'analiza finansowa', 'financial analysis', 'podatki', 'taxes', 
      'audyt', 'audit', 'bankowość', 'banking', 'inwestycje', 'investments', 'budżetowanie', 'budgeting', 
      'sprawozdawczość', 'reporting', 'płynność', 'liquidity', 'windykacja', 'debt collection', 'leasing', 
      'sap', 'oracle', 'ifrs', 'gaap', 'kontrola kosztów', 'cost control',

      // Marketing i sprzedaż
      'marketing', 'sprzedaż', 'sales', 'reklama', 'advertising', 'seo', 'social media', 'kampanie', 'campaigns', 
      'negocjacje', 'negotiations', 'obsługa klienta', 'customer service', 'e-commerce', 'branding', 'crm', 
      'content marketing', 'copywriting', 'analityka', 'analytics', 'google analytics', 'public relations', 'pr',

      // Produkcja i inżynieria
      'produkcja', 'production', 'automatyzacja', 'automation', 'jakość', 'quality', 'lean', 'six sigma', 
      'utrzymanie ruchu', 'maintenance', 'mechanika', 'mechanics', 'elektronika', 'electronics', 'cad', 'cam', 
      'projektowanie', 'design', 'budownictwo', 'construction', 'obróbka', 'processing', 'spawanie', 'welding',

      // Transport i logistyka
      'logistyka', 'logistics', 'transport', 'transportation', 'spedycja', 'forwarding', 'magazyn', 'warehouse', 
      'łańcuch dostaw', 'supply chain', 'wms', 'tms', 'erp', 'optymalizacja procesów', 'process optimization', 
      'prawo jazdy', 'driving license', 'wózek widłowy', 'forklift',

      // Medycyna i zdrowie
      'opieka', 'care', 'pielęgniarstwo', 'nursing', 'diagnostyka', 'diagnostics', 'rehabilitacja', 'rehabilitation', 
      'farmacja', 'pharmacy', 'medycyna', 'medicine', 'dietetyka', 'dietetics', 'psychologia', 'psychology',

      // Administracja i prawo
      'administracja', 'administration', 'prawo', 'law', 'dokumentacja', 'documentation', 'sekretariat', 'secretariat', 
      'rodo', 'gdpr', 'zamówienia publiczne', 'public procurement', 'archiwizacja', 'archiving',

      // HR i edukacja
      'rekrutacja', 'recruitment', 'kadry', 'hr', 'płace', 'payroll', 'szkolenia', 'training', 'edukacja', 'education', 
      'nauczanie', 'teaching', 'e-learning', 'coaching', 'mentoring',

      // Pozostałe branże
      'turystyka', 'tourism', 'hotelarstwo', 'hospitality', 'gastronomia', 'gastronomy', 'rolnictwo', 'agriculture', 
      'nieruchomości', 'real estate', 'media', 'dziennikarstwo', 'journalism', 'energetyka', 'energy', 
      'handel', 'trade', 'telekomunikacja', 'telecommunications'
    ],
    weight: 1.5,
    label: 'Umiejętności branżowe'
  },

  softSkills: {
    keywords: [
      // Komunikacja
      'komunikatywność', 'komunikacja', 'communication', 'wystąpienia publiczne', 'public speaking', 
      'prezentacje', 'presentations', 'słuchanie', 'listening', 'perswazja', 'persuasion', 'negocjacje', 
      'negotiations', 'asertywność', 'assertiveness', 'empatia', 'empathy',

      // Praca zespołowa
      'praca zespołowa', 'teamwork', 'współpraca', 'collaboration', 'liderstwo', 'leadership', 
      'motywowanie', 'motivating', 'mentoring', 'coaching', 'integracja', 'integration',

      // Organizacja
      'organizacja', 'organization', 'zarządzanie czasem', 'time management', 'planowanie', 'planning', 
      'priorytetyzacja', 'prioritization', 'dokładność', 'accuracy', 'terminowość', 'timeliness', 
      'wielozadaniowość', 'multitasking', 'efektywność', 'efficiency',

      // Adaptacja i rozwój
      'kreatywność', 'creativity', 'adaptacja', 'adaptation', 'elastyczność', 'flexibility', 'rozwój', 
      'development', 'inicjatywa', 'initiative', 'proaktywność', 'proactivity', 'samodzielność', 
      'independence', 'uczenie się', 'learning',

      // Rozwiązywanie problemów
      'rozwiązywanie problemów', 'problem solving', 'analiza', 'analysis', 'myślenie krytyczne', 
      'critical thinking', 'podejmowanie decyzji', 'decision making', 'innowacyjność', 'innovation',

      // Postawa
      'zaangażowanie', 'commitment', 'motywacja', 'motivation', 'odpowiedzialność', 'responsibility', 
      'rzetelność', 'reliability', 'etyka pracy', 'work ethics', 'lojalność', 'loyalty', 'profesjonalizm', 
      'professionalism', 'dyskrecja', 'discretion'
    ],
    weight: 1.0,
    label: 'Umiejętności miękkie'
  },

  requirements: {
    keywords: [
      // Wykształcenie i kwalifikacje
      'wykształcenie', 'education', 'studia', 'studies', 'dyplom', 'diploma', 'licencjat', 'bachelor', 
      'magister', 'master', 'doktor', 'phd', 'zawodowe', 'vocational', 'średnie', 'secondary', 'wyższe', 
      'higher', 'kierunek', 'field of study', 'specjalizacja', 'specialization', 'kwalifikacja', 
      'qualification', 'kurs', 'course', 'szkolenie', 'training',

      // Doświadczenie
      'doświadczenie', 'experience', 'praktyka', 'practice', 'staż', 'internship', 'lat', 'years', 
      'minimum', 'min.', 'co najmniej', 'at least', 'udokumentowane', 'documented', 'zawodowe', 
      'professional', 'mile widziane', 'nice to have', 'preferowane', 'preferred', 'dodatkowe', 'additional',

      // Certyfikaty i uprawnienia
      'certyfikat', 'certificate', 'uprawnienie', 'license', 'prawo jazdy', 'driving license', 'kategoria', 
      'category', 'pozwolenie', 'permit', 'atest', 'attestation', 'licencja', 'license',

      // Języki
      'język', 'language', 'angielski', 'english', 'niemiecki', 'german', 'francuski', 'french', 
      'hiszpański', 'spanish', 'rosyjski', 'russian', 'ukraiński', 'ukrainian', 'podstawowy', 'basic', 
      'zaawansowany', 'advanced', 'biegły', 'fluent',

      // Poziom i wymagania
      'znajomość', 'knowledge', 'umiejętność', 'skill', 'wymagane', 'required', 'obowiązkowe', 'mandatory', 
      'oczekiwane', 'expected', 'poziom', 'level', 'kompetencja', 'competence', 'praktyczna', 'practical', 
      'teoretyczna', 'theoretical'
    ],
    weight: 1.2,
    label: 'Wymagania'
  },

  benefits: {
    keywords: [
      // Warunki pracy
      'praca zdalna', 'remote work', 'zdalnie', 'remote', 'hybrydowo', 'hybrid', 'elastyczne godziny', 
      'flexible hours', 'stabilność', 'stability', 'stałe zatrudnienie', 'permanent employment', 
      'pełny etat', 'full-time', 'pół etatu', 'part-time', 'umowa', 'contract',

      // Wynagrodzenie i premie
      'wynagrodzenie', 'salary', 'premia', 'bonus', 'stawka', 'rate', 'dofinansowanie', 'funding', 
      'konkurencyjne', 'competitive', 'atrakcyjne', 'attractive', 'prowizja', 'commission',

      // Benefity pozapłacowe
      'pakiet medyczny', 'medical package', 'ubezpieczenie', 'insurance', 'karta multisport', 'multisport card', 
      'szkolenia', 'training', 'rozwój', 'development', 'urlop', 'vacation', 'kawa', 'coffee', 
      'owocowe czwartki', 'fruit thursdays', 'darmowy parking', 'free parking', 'telefon służbowy', 
      'company phone', 'laptop służbowy', 'company laptop', 'zniżki', 'discounts', 'karnet', 'voucher',

      // Atmosfera i kultura
      'przyjazna atmosfera', 'friendly atmosphere', 'wsparcie zespołu', 'team support', 'równowaga praca-życie', 
      'work-life balance', 'integracja', 'integration', 'wellbeing', 'dobrostan'
    ],
    weight: 0.8,
    label: 'Benefity'
  },

  generalJobTerms: {
    keywords: [
      // Stanowiska i role
      'stanowisko', 'position', 'praca', 'job', 'zatrudnienie', 'employment', 'kariera', 'career', 
      'specjalista', 'specialist', 'kierownik', 'manager', 'asystent', 'assistant', 'doradca', 'advisor', 
      'konsultant', 'consultant', 'analityk', 'analyst', 'inżynier', 'engineer', 'handlowiec', 'salesperson', 
      'księgowy', 'accountant', 'rekruter', 'recruiter', 'pracownik', 'employee',

      // Procesy i obowiązki
      'rekrutacja', 'recruitment', 'obowiązki', 'duties', 'zadania', 'tasks', 'projekt', 'project', 
      'zespół', 'team', 'firma', 'company', 'organizacja', 'organization', 'klient', 'client', 
      'proces', 'process', 'planowanie', 'planning', 'realizacja', 'execution', 'kontrola', 'control',

      // Warunki zatrudnienia
      'umowa o pracę', 'employment contract', 'umowa zlecenie', 'contract of mandate', 'b2b', 'etat', 
      'full-time position', 'praca zmianowa', 'shift work', 'nadgodziny', 'overtime', 'delegacje', 'business trips', 
      'awans', 'promotion', 'perspektywy', 'prospects', 'rynek', 'market', 'produkty', 'products', 'usługi', 'services'
    ],
    weight: 1.0,
    label: 'Ogólne pojęcia pracy'
  }
} as const

interface KeywordMatch {
  category: keyof typeof KEYWORDS_CATEGORIES
  keyword: string
  count: number
  score: number
  context: string[]
  isRequired: boolean
}

interface JobAnalysisProps {
  application: typeof mockApplications[0]
  isDesktop: boolean
  onKeywordsFound?: (keywords: Array<{ keyword: string, category: keyof typeof KEYWORDS_CATEGORIES }>) => void
}

export function JobAnalysis({ application, isDesktop, onKeywordsFound }: JobAnalysisProps) {
  const [keywordMatches, setKeywordMatches] = useState<KeywordMatch[]>([])
  const [analysisScore, setAnalysisScore] = useState<number>(0)
  const [cvSuggestions, setCvSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!application?.description) {
      return
    }

    const description = application.description.toLowerCase()
    const doc = nlp(description)
    const matches: KeywordMatch[] = []
    let totalScore = 0
    const suggestions: string[] = []
    const foundKeywords: Array<{ keyword: string, category: keyof typeof KEYWORDS_CATEGORIES }> = []

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
            category: category as keyof typeof KEYWORDS_CATEGORIES
          })
          const context = sentences.filter((sentence: string) =>
            sentence.toLowerCase().includes(keyword)
          ).slice(0, 2)

          const isRequired = context.some((sentence: string) =>
            sentence.includes('wymagane') || 
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
            category: category as keyof typeof KEYWORDS_CATEGORIES,
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

  const getCategoryColor = (category: keyof typeof KEYWORDS_CATEGORIES) => {
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
                    {KEYWORDS_CATEGORIES[category as keyof typeof KEYWORDS_CATEGORIES].label}
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