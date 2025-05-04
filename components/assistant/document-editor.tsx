"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  List, 
  Indent, 
  AlignLeft, 
  Copy, 
  Save, 
  Loader2 
} from "lucide-react";

interface DocumentEditorProps {
  value: string;
  onChange: (value: string) => void;
  isGenerating: boolean;
}

export function DocumentEditor({
  value,
  onChange,
  isGenerating
}: DocumentEditorProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Funkcje formatowania tekstu
  const addBold = () => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      if (selectedText) {
        const newText = 
          value.substring(0, start) + 
          `**${selectedText}**` + 
          value.substring(end);
        
        onChange(newText);
        
        // Ustaw kursor po pogrubionym tekście
        setTimeout(() => {
          textarea.selectionStart = end + 4; // +4 for the ** markers
          textarea.selectionEnd = end + 4;
          textarea.focus();
        }, 0);
      }
    }
  };

  const addItalic = () => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      if (selectedText) {
        const newText = 
          value.substring(0, start) + 
          `_${selectedText}_` + 
          value.substring(end);
        
        onChange(newText);
        
        // Ustaw kursor po kursywie
        setTimeout(() => {
          textarea.selectionStart = end + 2; // +2 for the _ markers
          textarea.selectionEnd = end + 2;
          textarea.focus();
        }, 0);
      }
    }
  };

  const addBulletPoint = () => {
    // Dodajemy podpunkt na początku jeśli tekst jest pusty
    if (!value.trim()) {
      onChange('• ');
      return;
    }

    // Pobieramy pozycję kursora
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Sprawdzamy, czy kursor jest na początku linii
      const textBeforeCursor = value.substring(0, start);
      const textAfterCursor = value.substring(end);
      
      // Znajdź początek aktualnej linii
      const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
      const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
      
      // Sprawdź, czy linia już zaczyna się od podpunktu
      const currentLine = textBeforeCursor.substring(lineStart);
      if (currentLine.trimStart().startsWith('•')) {
        return; // Nie dodawaj podpunktu, jeśli już jest
      }
      
      // Dodaj podpunkt na początku aktualnej linii
      const newText = 
        textBeforeCursor.substring(0, lineStart) + 
        '• ' + 
        textBeforeCursor.substring(lineStart) + 
        textAfterCursor;
      
      onChange(newText);
      
      // Ustaw kursor po podpunkcie
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = lineStart + 2;
        textarea.focus();
      }, 0);
    }
  };

  const addIndent = () => {
    // Dodajemy wcięcie na początku jeśli tekst jest pusty
    if (!value.trim()) {
      onChange('    ');
      return;
    }

    // Pobieramy pozycję kursora
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Sprawdzamy, czy zaznaczony jest tekst
      if (start !== end) {
        // Dodaj wcięcie do każdej linii w zaznaczeniu
        const selectedText = value.substring(start, end);
        const lines = selectedText.split('\n');
        const indentedLines = lines.map(line => '    ' + line);
        const newText = 
          value.substring(0, start) + 
          indentedLines.join('\n') + 
          value.substring(end);
        
        onChange(newText);
        
        // Dostosuj pozycję kursora po zmianie
        const newStart = start;
        const newEnd = start + indentedLines.join('\n').length;
        
        setTimeout(() => {
          textarea.selectionStart = newStart;
          textarea.selectionEnd = newEnd;
          textarea.focus();
        }, 0);
        
        return;
      }
      
      // Znajdź początek aktualnej linii
      const textBeforeCursor = value.substring(0, start);
      const textAfterCursor = value.substring(end);
      const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
      const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
      
      // Dodaj wcięcie na początku aktualnej linii
      const newText = 
        value.substring(0, lineStart) + 
        '    ' + 
        value.substring(lineStart);
      
      onChange(newText);
      
      // Ustaw kursor uwzględniając dodane wcięcie
      setTimeout(() => {
        const newPosition = start + 4;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
        textarea.focus();
      }, 0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      
      {/* Toolbar */}
      <div className="flex gap-1 border rounded-t-md border-b-0 bg-gray-50 p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={addBold}
          disabled={isGenerating}
          title="Pogrubienie"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={addItalic}
          disabled={isGenerating}
          title="Kursywa"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={addBulletPoint}
          disabled={isGenerating}
          title="Lista punktowana"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={addIndent}
          disabled={isGenerating}
          title="Wcięcie"
        >
          <Indent className="h-4 w-4" />
        </Button>
        
        <div className="flex-1"></div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={copyToClipboard}
          disabled={!value || isGenerating}
          title="Kopiuj do schowka"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[350px] font-mono text-sm whitespace-pre-wrap rounded-t-none"
        placeholder={isGenerating ? "Generowanie dokumentu..." : "Tutaj pojawi się wygenerowany dokument..."}
        disabled={isGenerating}
      />
      
      {/* Actions */}
      <div className="flex justify-end space-x-2">
        {isCopied && (
          <div className="text-sm text-green-600 flex items-center mr-2">
            Skopiowano do schowka!
          </div>
        )}
        <Button
          variant="outline"
          onClick={copyToClipboard}
          disabled={!value || isGenerating}
        >
          Kopiuj do schowka
        </Button>
        <Button
          disabled={!value || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generowanie...
            </>
          ) : (
            "Zapisz"
          )}
        </Button>
      </div>
    </div>
  );
} 