import { ApplicationStatus } from "./SavedTableTabs"

export interface Application {
  id: string
  position: string
  company: string
  url: string
  date: string
  status: ApplicationStatus
  validUntil: string
  description: string
  priority?: number
  site: string
}

export const mockApplications: Application[] = [
 
  {
    id: "6",
    position: "DevOps Engineer",
    company: "CloudTech",
    url: "https://cloudtech.io/jobs",
    date: "2023-03-20",
    status: "zapisana",
    validUntil: "2024-04-20",
    description: "Twój zakres obowiązków\nProjektowanie i wdrażanie infrastruktury chmurowej AWS.\nZapewnienie obsługi AWS Key Management System (KMS) w nowej strefie AWS.\nUtrzymanie bezpieczeństwa komunikacji i failover systemu Surveil-X.\nTworzenie dokumentacji technicznej i przekazywanie gotowych rozwiązań zespołom operacyjnym.\nWspółpraca z zespołami IT oraz działem compliance w zakresie nadzoru nad transakcjami i bezpieczeństwa.\nNasze wymagania\nDoświadczenie w architekturze i implementacji rozwiązań chmurowych AWS.\nZnajomość zarządzania kluczami szyfrującymi (KMS, HashiCorp Vault).\nDoświadczenie w sektorze finansowym.\nUmiejętność efektywnej komunikacji i koordynacji projektów.\nZnajomość technologii: Python, Terraform, Ansible Tower, Bitbucket, Jenkins, DevOps.\nMile widziane",
    priority: 2,
    site: "pracuj.pl"
  },

  {
    id: "14",
    position: "Frontend Lead",
    company: "WebFront",
    url: "https://webfront.io/jobs",
    date: "2023-04-08",
    status: "kontakt",
    validUntil: "2024-05-08",
    description: "Twój zakres obowiązków\nOpieka nad bazą i pozyskiwanie nowych Klientów\nRealizowanie celów sprzedażowych\nTworzenie ofert w odpowiedzi na potrzeby klientów oraz negocjowanie warunków współpracy\nBieżące raportowanie wyników pracy\nNasze wymagania\nZorientowanie na cel\nŁatwość nawiązywania kontaktów i budowania relacji\nEnergia i pozytywne nastawienie\nUmiejętność samodzielnej organizacji pracy i planowania w ramach ustalonych standardów\nCzynne prawo jazdy kat. B\nTo oferujemy\nCiekawą pracę w dynamicznej i rozwijającej się międzynarodowej organizacji\nSamochód służbowy, telefon komórkowy i inne niezbędne narzędzia pracy\nUmowę o pracę oraz system premiowy powiązany z osiąganymi wynikami sprzedaży\nMożliwość rozwoju zawodowego",
    priority: 2,
    site: "rocetjobs.pl"
  },
  {
    id: "15",
    position: "Python Developer",
    company: "PythonTech",
    url: "https://pythontech.com/careers",
    date: "2023-04-10",
    status: "wysłana",
    validUntil: "2024-05-10",
    description: "Twój zakres obowiązków\nOpieka nad bazą i pozyskiwanie nowych Klientów\nRealizowanie celów sprzedażowych\nTworzenie ofert w odpowiedzi na potrzeby klientów oraz negocjowanie warunków współpracy\nBieżące raportowanie wyników pracy\nNasze wymagania\nZorientowanie na cel\nŁatwość nawiązywania kontaktów i budowania relacji\nEnergia i pozytywne nastawienie\nUmiejętność samodzielnej organizacji pracy i planowania w ramach ustalonych standardów\nCzynne prawo jazdy kat. B\nTo oferujemy\nCiekawą pracę w dynamicznej i rozwijającej się międzynarodowej organizacji\nSamochód służbowy, telefon komórkowy i inne niezbędne narzędzia pracy\nUmowę o pracę oraz system premiowy powiązany z osiąganymi wynikami sprzedaży\nMożliwość rozwoju zawodowego",
    priority: 1,
    site: "linkedin"
  },
  {
    id: "16",
    position: "Security Engineer",
    company: "SecureNet",
    url: "https://securenet.com/jobs",
    date: "2023-04-12",
    status: "kontakt",
    validUntil: "2024-05-12",
    description: "Twój zakres obowiązków\nOpieka nad bazą i pozyskiwanie nowych Klientów\nRealizowanie celów sprzedażowych\nTworzenie ofert w odpowiedzi na potrzeby klientów oraz negocjowanie warunków współpracy\nBieżące raportowanie wyników pracy\nNasze wymagania\nZorientowanie na cel\nŁatwość nawiązywania kontaktów i budowania relacji\nEnergia i pozytywne nastawienie\nUmiejętność samodzielnej organizacji pracy i planowania w ramach ustalonych standardów\nCzynne prawo jazdy kat. B\nTo oferujemy\nCiekawą pracę w dynamicznej i rozwijającej się międzynarodowej organizacji\nSamochód służbowy, telefon komórkowy i inne niezbędne narzędzia pracy\nUmowę o pracę oraz system premiowy powiązany z osiąganymi wynikami sprzedaży\nMożliwość rozwoju zawodowego",
    priority: 2,
    site: "aplikuj.pl"
  },
  {
    id: "17",
    position: "Cloud Architect",
    company: "CloudArch",
    url: "https://cloudarch.io/careers",
    date: "2023-04-15",
    status: "rozmowa",
    validUntil: "2024-05-15",
    description: "Twój zakres obowiązków\nOpieka nad bazą i pozyskiwanie nowych Klientów\nRealizowanie celów sprzedażowych\nTworzenie ofert w odpowiedzi na potrzeby klientów oraz negocjowanie warunków współpracy\nBieżące raportowanie wyników pracy\nNasze wymagania\nZorientowanie na cel\nŁatwość nawiązywania kontaktów i budowania relacji\nEnergia i pozytywne nastawienie\nUmiejętność samodzielnej organizacji pracy i planowania w ramach ustalonych standardów\nCzynne prawo jazdy kat. B\nTo oferujemy\nCiekawą pracę w dynamicznej i rozwijającej się międzynarodowej organizacji\nSamochód służbowy, telefon komórkowy i inne niezbędne narzędzia pracy\nUmowę o pracę oraz system premiowy powiązany z osiąganymi wynikami sprzedaży\nMożliwość rozwoju zawodowego",
    priority: 1,
    site: "indeed"
  },
  {
    id: "18",
    position: "Database Administrator",
    company: "DataBase",
    url: "https://database.com/jobs",
    date: "2023-04-18",
    status: "kontakt",
    validUntil: "2024-05-18",
    description: "Twój zakres obowiązków\nOpieka nad bazą i pozyskiwanie nowych Klientów\nRealizowanie celów sprzedażowych\nTworzenie ofert w odpowiedzi na potrzeby klientów oraz negocjowanie warunków współpracy\nBieżące raportowanie wyników pracy\nNasze wymagania\nZorientowanie na cel\nŁatwość nawiązywania kontaktów i budowania relacji\nEnergia i pozytywne nastawienie\nUmiejętność samodzielnej organizacji pracy i planowania w ramach ustalonych standardów\nCzynne prawo jazdy kat. B\nTo oferujemy\nCiekawą pracę w dynamicznej i rozwijającej się międzynarodowej organizacji\nSamochód służbowy, telefon komórkowy i inne niezbędne narzędzia pracy\nUmowę o pracę oraz system premiowy powiązany z osiąganymi wynikami sprzedaży\nMożliwość rozwoju zawodowego",
    priority: 2,
    site: "praca.pl"
  },
  {
    id: "19",
    position: "Technical Writer",
    company: "DocTech",
    url: "https://doctech.com/careers",
    date: "2023-04-20",
    status: "zapisana",
    validUntil: "2024-05-20",
    description: "Twój zakres obowiązków\nOpieka nad bazą i pozyskiwanie nowych Klientów\nRealizowanie celów sprzedażowych\nTworzenie ofert w odpowiedzi na potrzeby klientów oraz negocjowanie warunków współpracy\nBieżące raportowanie wyników pracy\nNasze wymagania\nZorientowanie na cel\nŁatwość nawiązywania kontaktów i budowania relacji\nEnergia i pozytywne nastawienie\nUmiejętność samodzielnej organizacji pracy i planowania w ramach ustalonych standardów\nCzynne prawo jazdy kat. B\nTo oferujemy\nCiekawą pracę w dynamicznej i rozwijającej się międzynarodowej organizacji\nSamochód służbowy, telefon komórkowy i inne niezbędne narzędzia pracy\nUmowę o pracę oraz system premiowy powiązany z osiąganymi wynikami sprzedaży\nMożliwość rozwoju zawodowego",
    priority: 1,
    site: "kwf.pl"
  },
  {
    id: "20",
    position: "AI Engineer",
    company: "AITech",
    url: "https://aitech.com/jobs",
    date: "2023-04-22",
    status: "kontakt",
    validUntil: "2024-05-22",
    description: "Twój zakres obowiązków\nOpieka nad bazą i pozyskiwanie nowych Klientów\nRealizowanie celów sprzedażowych\nTworzenie ofert w odpowiedzi na potrzeby klientów oraz negocjowanie warunków współpracy\nBieżące raportowanie wyników pracy\nNasze wymagania\nZorientowanie na cel\nŁatwość nawiązywania kontaktów i budowania relacji\nEnergia i pozytywne nastawienie\nUmiejętność samodzielnej organizacji pracy i planowania w ramach ustalonych standardów\nCzynne prawo jazdy kat. B\nTo oferujemy\nCiekawą pracę w dynamicznej i rozwijającej się międzynarodowej organizacji\nSamochód służbowy, telefon komórkowy i inne niezbędne narzędzia pracy\nUmowę o pracę oraz system premiowy powiązany z osiąganymi wynikami sprzedaży\nMożliwość rozwoju zawodowego",
    priority: 2,
    site: "justjoin.it"
  },
  {
    id: "21",
    position: "Inżynier Sprzedaży",
    company: "NETZSCH Instrumenty Sp. z o.o",
    url: "https://netzsch.com/careers",
    date: "2024-03-09",
    status: "zapisana",
    validUntil: "2025-03-14",
    description: "Twój zakres obowiązków\nSprzedaż aparatury do analizy termicznej, reologii i badań ogniowych\nAktywne pozyskiwanie nowych Klientów na terenie Polski\nUtrzymywanie relacji i współpracy z istniejącymi Klientami\nRealizacja założonych planów sprzedażowych\nOrganizacja i prowadzenie seminariów, webionariów, szkoleń i pokazów aparatury\nUdział w konferencjach naukowych i targach branżowych\nNasze wymagania\nWykształcenie wyższe techniczne: inżynieria materiałowa, technologia chemiczna, fizyka techniczna lub pokrewne\nBardzo dobra organizacja pracy\nOtwartość, łatwość nawiązywania kontaktów\nPrawo jazdy kategorii B\nZnajomość języka angielskiego\nGotowość do częstych wyjazdów służbowych\nMile widziane\nDoświadczenie w sprzedaży aparatury naukowo badawczej, zwłaszcza w zakresie reologii\nTo oferujemy\nStabilne zatrudnienie w oparciu o umowę o pracę\nElastyczny czas pracy\nPracę w międzynarodowym środowisku\nSpecjalistyczne szkolenia\nSamochód służbowy, także do użytku prywatnego, laptop, telefon\nMotywacyjny system wynagrodzeń\nŚwiadczenia pozapłacowe: karta multisport, „wczasy pod gruszą",
    priority: 3,
    site: "gowork.pl"
  },
  {
    id: "22",
    position: "Terenowy Doradca Handlowy",
    company: "Mondelēz International w Polsce",
    url: "https://mondelez.pl/careers",
    date: "2024-03-09",
    status: "zapisana",
    validUntil: "2025-03-19",
    description: "Twój zakres obowiązków\nRealizowanie zadań i maksymalizacja sprzedaży produktów MDLZ na powierzonym terenie\nRealizowanie celów jakościowych (KPI) w obsługiwanych punktach sprzedaży\nBudowa przewagi konkurencyjnej poprzez rozwój poziomu dystrybucji, ekspozycji oraz widoczności półkowej\nTworzenie lokalnych inicjatyw sprzedażowych\nEfektywna współpraca z dystrybutorami i hurtowniami na podległym terenie\nPozyskiwanie nowych klientów\nRaportowanie działań\nNasze wymagania\nMinimum 2 lata doświadczenia w sprzedaży dóbr szybko zbywalnych FMCG w kanale tradycyjnym\nOrientacja na realizację postawionych celów\nSzeroko rozwinięte zdolności sprzedażowe i negocjacyjne\nInicjatywa i duża samodzielność w działaniu\nUmiejętność pracy w zespole\nWażne prawo jazdy kat. B\nBiegła znajomość języka polskiego w mowie i piśmie\nTo oferujemy\nUmowa o pracę na czas nieokreślony bez okresu próbnego\nSystem premii kwartalnych\nDofinansowanie pakietu Multisport\nOpieka medyczna LuxMed\nUbezpieczenie na życie\nPracowniczy Program Emerytalny\nNarzędzia pracy – telefon, tablet, samochód 24/7, również do użytku prywatnego\nWsparcie w rozwoju poprzez szkolenia\nElastyczność i swoboda w działaniu\nCykliczne, motywujące spotkania w ramach zespołu",
    priority: 2,
    site: "nofluffyjobs"
  },
  {
    id: "23",
    position: "Monter maszyn i linii produkcyjnych",
    company: "SEARCHERS",
    url: "https://searchers.pl/careers",
    date: "2024-03-09",
    status: "zapisana",
    validUntil: "2025-03-30",
    description: "Twój zakres obowiązków\nMontaż maszyn i linii produkcyjnych zgodnie z dokumentacją techniczną\nUruchomienia oraz testy maszyn i linii produkcyjnych w zakładzie produkcyjnym i u klientów\nPraca w nowoczesnym zakładzie produkcyjnym + do około 30% czasu pracy delegacje na montaż i próbne uruchomienia w Polsce, Europie, i w innych rejonach świata\nRozwiązywanie technicznych problemów podczas pracy\nSamokontrola przeprowadzonych czynności\nNasze wymagania\nDoświadczenie w pracy przy montażu mechanicznym, np. urządzeń, maszyn, linii produkcyjnych\nUmiejętność czytania rysunków / schematów technicznych\nPrzydatne będzie ukończenie szkoły o profilu technicznym\nPrzydatne będzie rozumienie podstawowych zasad wprawiania w ruch i sterowania mechanizmów z wykorzystaniem sprężonego powietrza\nUmiejętność pracy w zespole\nDbałość o detale, czystość na stanowisku\nGotowość do delegacji (do około 30%-40% czasu pracy)\nTo oferujemy\nStałe zatrudnienie w oparciu o umowę o pracę bezpośrednio z przedsiębiorstwem produkcyjnym\nBardzo dobre finanse w podstawie\nPracę w zakładzie produkcyjnym na jedną zmianę od poniedziałku do piątku + delegacje\nZaawansowany pakiet prywatnej opieki medycznej, kartę multisport\nUdział w porządnych szkoleniach technicznych\nBardzo pomocnych przełożonych\nBezpieczny parking firmowy",
    priority: 1,
    site: "nofluffyjobs"
  },
  {
    id: "24",
    position: "Magazynier",
    company: "Orion Znakowanie Towarów Sp. z o.o.",
    url: "https://orion.pl/careers",
    date: "2024-03-09",
    status: "zapisana",
    validUntil: "2025-04-08",
    description: "Twój zakres obowiązków\nPrzyjmowanie dostaw surowców na magazyn\nWydawanie surowca na produkcję wg harmonogramu produkcji\nPrzyjmowanie zwrotów surowców z produkcji (ważenie rolek)\nNadawanie lokalizacji towaru na magazynie (BIN) czytnikami\nObsługa paleciaka elektrycznego i wózka widłowego czołowego\nInwentaryzacja magazynów\nCodzienne prace porządkowe na hali i magazynie\nNasze wymagania\nUprawnienia do obsługi elektrycznego wózka widłowego\nOgólna sprawność fizyczna\nGotowość do nauki nowych rzeczy, np. obsługi czytnika itp.\nDyspozycyjność: praca 3-zmianowa, rzadko w soboty\nZnajomość 5S będzie dodatkowym atutem Kandydata\nTo oferujemy\nPraca na nowym technicznie magazynie w temp >21 stC\nZorganizowany przez pracodawcę dojazd z Wrocławia lub dofinansowanie dojazdu własnego\nZatrudnienie w oparciu o umowę o pracę\nPełne przyuczenie do zawodu\nBardzo dobre warunki socjalne w zakładzie\nMożliwość skorzystania z pakietu rekreacyjno-sportowego Multisport\nDofinansowane obiady w zakładzie\nEventy sportowe i turystyczne dla pracowników",
    priority: 1,
    site: "pracuj.pl"
  },
  {
    id: "25",
    position: "Pracownik Sklepu",
    company: "Action",
    url: "https://action.jobs/pl",
    date: "2024-03-09",
    status: "zapisana",
    validUntil: "2024-04-09",
    description: "Twój zakres obowiązków\nDbanie o schludność i porządek w sklepie\nEkspozycja towaru na półkach\nPomoc klientom w znalezieniu produktów\nObsługa kasy\nPrace porządkowe\nNasze wymagania\nWiek minimum 18 lat\nWykształcenie co najmniej średnie\nDyspozycyjność do pracy w elastycznym grafiku (10-40h/tyg)\nGotowość do pracy w weekendy i wieczory\nEnergia i umiejętność pracy zespołowej\nTo oferujemy\nStabilna praca blisko domu z elastycznymi godzinami\nUmowa od 10 do 40 godzin tygodniowo\nRabat pracowniczy 15% na wszystkie produkty\nBezpłatna opieka medyczna\nUbezpieczenie grupowe\nKarta Multisport\nPraca w odnoszącej sukcesy sieci detalicznej",
    priority: 2,
    site: "infopraca.pl"
  },
  {
    id: "26",
    position: "Pracownik biurowy ds. magazynowych",
    company: "Ochrona Juwentus",
    url: "https://juwentus.pl/kariera",
    date: "2024-03-09",
    status: "zapisana",
    validUntil: "2024-04-09",
    description: "Twój zakres obowiązków\nBieżąca praca administracyjno-biurowa\nWydawanie, przyjmowanie oraz kontrola asortymentu magazynowego\nBieżące monitorowanie i raportowanie stanów magazynowych\nPakowanie i kompletowanie zamówień\nRozmieszczanie materiałów na magazynie\nWspółpraca z innymi działami\nUdział w inwentaryzacjach\nNasze wymagania\nWykształcenie minimum średnie\nSkrupulatność i rzetelność\nWysokie poczucie odpowiedzialności\nUmiejętność pracy w zespole\nZnajomość MS Office\nMile widziane doświadczenie w pracy w magazynie\nTo oferujemy\nStabilne warunki zatrudnienia\nPracę w stałych godzinach (pn-pt 8:00-16:00)\nSzkolenia produktowe\nMożliwość rozwoju zawodowego\nPakiet opieki medycznej\nUbezpieczenie grupowe",
    priority: 1, 
    site: "infopraca.pl"
  },
  {
    id: "27",
    position: "Pracownik Obsługi Klienta",
    company: "Poczta Polska",
    url: "https://kariera.poczta-polska.pl",
    date: "2024-03-09",
    status: "zapisana",
    validUntil: "2024-04-09",
    description: "Twój zakres obowiązków\nObsługa klientów w urzędzie pocztowym\nSprzedaż usług i produktów Poczty Polskiej\nRejestracja operacji w systemach informatycznych\nSporządzanie dokumentacji\nNasze wymagania\nWykształcenie minimum średnie\nUmiejętność obsługi komputera (MS Office)\nKomunikatywność\nUmiejętność pracy z klientem\nOdpowiedzialność i dokładność\nMile widziane doświadczenie w obsłudze klienta\nTo oferujemy\nWsparcie opiekuna w okresie wdrożenia\nPrywatną opiekę medyczną\nUbezpieczenie na życie\nDofinansowanie do wypoczynku\nKartę Multisport\nTrzynastą pensję\nDodatek stażowy\nZniżki na paliwo",
    priority: 2,
    site: "infopraca.pl"
  }
] 