"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Typy dla dokumentów
type DocumentType = 
  | "welcome-message" 
  | "status-inquiry" 
  | "thank-you" 
  | "feedback-request" 
  | "clarification-request" 
  | "team-welcome"

// Interfejs dla danych wejściowych
interface DocumentAssistantProps {
  jobOfferId?: string
  cvId?: string
}

export function DocumentAssistant({ jobOfferId, cvId }: DocumentAssistantProps) {
  const [documentType, setDocumentType] = useState<DocumentType>("welcome-message")
  const [customContent, setCustomContent] = useState("")
  const [generatedDocument, setGeneratedDocument] = useState("")

  // Funkcja do generowania dokumentu
  const generateDocument = () => {
    // TODO: Implementacja generowania dokumentu
    const template = getDocumentTemplate(documentType)
    setGeneratedDocument(template)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Asystent Dokumentów</h2>
          <p className="text-gray-600 mb-6">
            Wygeneruj profesjonalne dokumenty i wiadomości związane z procesem rekrutacji.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Typ dokumentu</Label>
            <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ dokumentu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome-message">Wiadomość powitalna</SelectItem>
                <SelectItem value="status-inquiry">Zapytanie o status</SelectItem>
                <SelectItem value="thank-you">Podziękowania po rozmowie</SelectItem>
                <SelectItem value="feedback-request">Prośba o feedback</SelectItem>
                <SelectItem value="clarification-request">Prośba o doprecyzowanie</SelectItem>
                <SelectItem value="team-welcome">Wiadomość do zespołu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {jobOfferId && (
            <div className="space-y-2">
              <Label>Wybrana oferta pracy</Label>
              <Input value={jobOfferId} disabled />
            </div>
          )}

          {cvId && (
            <div className="space-y-2">
              <Label>Wybrane CV</Label>
              <Input value={cvId} disabled />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="custom-content">Dodatkowe informacje (opcjonalne)</Label>
            <Textarea
              id="custom-content"
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="Dodaj dodatkowe informacje, które mają znaleźć się w dokumencie..."
            />
          </div>

          <Button onClick={generateDocument} className="w-full">
            Generuj dokument
          </Button>

          {generatedDocument && (
            <div className="space-y-2">
              <Label>Wygenerowany dokument</Label>
              <Card className="p-4 bg-gray-50">
                <pre className="whitespace-pre-wrap">{generatedDocument}</pre>
              </Card>
              <Button variant="outline" className="w-full">
                Kopiuj do schowka
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Funkcja pomocnicza do generowania szablonów
function getDocumentTemplate(type: DocumentType): string {
  const templates = {
    "welcome-message": `Szanowni Państwo,

Z wielką przyjemnością aplikuję na stanowisko [NAZWA STANOWISKA] w [NAZWA FIRMY]. Po zapoznaniu się z ofertą pracy, jestem przekonany/a, że moje doświadczenie i umiejętności idealnie wpasowują się w wymagania tego stanowiska.

[PERSONALIZOWANA TREŚĆ]

Z wyrazami szacunku,
[IMIĘ I NAZWISKO]`,
    "status-inquiry": `Szanowni Państwo,

chciałbym/chciałabym zapytać o aktualny status mojej aplikacji na stanowisko [NAZWA STANOWISKA]. Złożyłem/złożyłam aplikację w dniu [DATA] i jestem bardzo zainteresowany/a dalszym przebiegiem procesu rekrutacyjnego.

[PERSONALIZOWANA TREŚĆ]

Z wyrazami szacunku,
[IMIĘ I NAZWISKO]`,
    "thank-you": `Szanowni Państwo,

chciałbym/chciałabym serdecznie podziękować za możliwość udziału w rozmowie kwalifikacyjnej na stanowisko [NAZWA STANOWISKA]. Rozmowa była dla mnie bardzo wartościowym doświadczeniem i utwierdziła mnie w przekonaniu, że [NAZWA FIRMY] to miejsce, w którym chciałbym/chciałabym rozwijać swoją karierę.

[PERSONALIZOWANA TREŚĆ]

Z wyrazami szacunku,
[IMIĘ I NAZWISKO]`,
    "feedback-request": `Szanowni Państwo,

chciałbym/chciałabym prosić o informację zwrotną dotyczącą mojej aplikacji na stanowisko [NAZWA STANOWISKA]. Każda informacja na temat moich mocnych stron i obszarów do rozwoju będzie dla mnie bardzo cenna w dalszym rozwoju zawodowym.

[PERSONALIZOWANA TREŚĆ]

Z wyrazami szacunku,
[IMIĘ I NAZWISKO]`,
    "clarification-request": `Szanowni Państwo,

chciałbym/chciałabym prosić o doprecyzowanie kilku kwestii dotyczących oferty pracy na stanowisko [NAZWA STANOWISKA]. W szczególności interesują mnie następujące aspekty:

[LISTA PYTAN]

[PERSONALIZOWANA TREŚĆ]

Z wyrazami szacunku,
[IMIĘ I NAZWISKO]`,
    "team-welcome": `Szanowni Państwo,

z ogromną radością przyjąłem/am ofertę pracy na stanowisku [NAZWA STANOWISKA] w [NAZWA FIRMY]. Chciałbym/chciałabym serdecznie przywitać się z przyszłym zespołem i wyrazić moje podekscytowanie możliwością wspólnej pracy.

[PERSONALIZOWANA TREŚĆ]

Z wyrazami szacunku,
[IMIĘ I NAZWISKO]`
  }

  return templates[type]
} 