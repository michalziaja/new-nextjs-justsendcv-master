"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  SaveIcon, 
  CopyIcon, 
  TrashIcon, 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  ListIcon, 
  AlignLeftIcon, 
  AlignCenterIcon, 
  AlignRightIcon,
  CheckIcon
} from 'lucide-react';
import { useAssistant } from './assistantContext';

export default function DokumentEditor() {
  const { generatedText, setGeneratedText, saveTemplate, isGenerating } = useAssistant();
  
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleSaveTemplate = () => {
    if (newTemplateName.trim() === '') return;
    saveTemplate(newTemplateName, generatedText);
    setNewTemplateName('');
    setShowSaveDialog(false);
  };
  
  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const applyFormatting = (type: 'bold' | 'italic' | 'underline') => {
    switch(type) {
      case 'bold':
        setIsBold(!isBold);
        break;
      case 'italic':
        setIsItalic(!isItalic);
        break;
      case 'underline':
        setIsUnderline(!isUnderline);
        break;
    }
  };
  
  const setAlignment = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align);
  };
  
  const getTextAreaClassName = () => {
    let className = "h-[265px] border-0 ";
    
    if (isBold) className += "font-bold ";
    if (isItalic) className += "italic ";
    if (isUnderline) className += "underline ";
    
    if (textAlign === 'center') className += "text-center ";
    else if (textAlign === 'right') className += "text-right ";
    
    return className;
  };
  
  return (
    <Card className="p-4 h-[55vh] shadow-[2px_4px_10px_rgba(0,0,0,0.3)] bg-gray-50 dark:bg-sidebar rounded-sm">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Wygenerowana wiadomość</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setGeneratedText('')}
            disabled={!generatedText}
            className="border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600 rounded-sm"
          >
            <TrashIcon size={16} className="mr-1" />
            Wyczyść
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyToClipboard}
            disabled={!generatedText}
            className="border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600 rounded-sm"
          >
            {copied ? <CheckIcon size={16} className="mr-1" /> : <CopyIcon size={16} className="mr-1" />}
            {copied ? 'Skopiowano' : 'Kopiuj'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            disabled={!generatedText}
            className="border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600 rounded-sm"
          >
            <SaveIcon size={16} className="mr-1" />
            Zapisz
          </Button>
        </div>
      </div>
      
      <div className="mb-2 flex gap-2">
        <Button 
          variant={isBold ? "default" : "outline"} 
          size="sm" 
          onClick={() => applyFormatting('bold')}
          title="Pogrubienie"
          className={`${!isBold && 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} rounded-sm`}
        >
          <BoldIcon size={16} />
        </Button>
        <Button 
          variant={isItalic ? "default" : "outline"} 
          size="sm" 
          onClick={() => applyFormatting('italic')}
          title="Kursywa"
          className={`${!isItalic && 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} rounded-sm`}
        >
          <ItalicIcon size={16} />
        </Button>
        <Button 
          variant={isUnderline ? "default" : "outline"} 
          size="sm" 
          onClick={() => applyFormatting('underline')}
          title="Podkreślenie"
          className={`${!isUnderline && 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} rounded-sm`}
        >
          <UnderlineIcon size={16} />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          title="Lista punktowana"
          className="border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600 rounded-sm"
        >
          <ListIcon size={16} />
        </Button>
        <div className="ml-auto flex gap-1">
          <Button 
            variant={textAlign === 'left' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setAlignment('left')}
            title="Wyrównaj do lewej"
            className={`${textAlign !== 'left' && 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} rounded-sm`}
          >
            <AlignLeftIcon size={16} />
          </Button>
          <Button 
            variant={textAlign === 'center' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setAlignment('center')}
            title="Wyśrodkuj"
            className={`${textAlign !== 'center' && 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} rounded-sm`}
          >
            <AlignCenterIcon size={16} />
          </Button>
          <Button 
            variant={textAlign === 'right' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setAlignment('right')}
            title="Wyrównaj do prawej"
            className={`${textAlign !== 'right' && 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} rounded-sm`}
          >
            <AlignRightIcon size={16} />
          </Button>
        </div>
      </div>
      
      {showSaveDialog && (
        <div className="mb-4 p-3 border border-gray-200 rounded-sm bg-gray-50 dark:bg-sidebar">
          <Label htmlFor="template-name" className="mb-2 block text-sm font-medium">Nazwa szablonu</Label>
          <div className="flex gap-2">
            <Input 
              id="template-name" 
              value={newTemplateName} 
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Podaj nazwę szablonu..."
              className="rounded-sm border-gray-200 dark:border-gray-600"
            />
            <Button 
              onClick={handleSaveTemplate}
              disabled={newTemplateName.trim() === ''}
              className={`px-4 py-2 rounded-sm transition ${
                newTemplateName.trim() !== ''
                  ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Zapisz
            </Button>
          </div>
        </div>
      )}
      
      <div className="relative rounded-sm border border-gray-200 dark:border-gray-600">
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mb-2"></div>
              <p className="text-purple-700">Generowanie wiadomości...</p>
            </div>
          </div>
        )}
        
        <Textarea 
          placeholder="Tutaj pojawi się wygenerowana wiadomość..." 
          className={getTextAreaClassName()}
          value={generatedText}
          onChange={(e) => setGeneratedText(e.target.value)}
        />
      </div>
      
      {/* Wskazówka na dole */}
      {generatedText && (
        <div className="mt-0 p-3 bg-blue-50 border border-blue-100 rounded">
          <p className="text-xs text-blue-700">
            <strong>Wskazówka:</strong> Możesz edytować tekst wiadomości, dostosowując go do swoich potrzeb. Nie zapomnij personalizować wiadomości przed wysłaniem!
          </p>
        </div>
      )}
    </Card>
  );
} 