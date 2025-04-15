"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  UopOptionsState,
  UopContractType
} from './utils/types';
import { PPK_RATES, ACCIDENT_RATES } from './data/constants';

// Interfejs dla komponentu
interface CalculatorInputProps {
  value: number;
  onValueChange: (value: number) => void;
  calcDirection: string;
  onCalcDirectionChange: (type: string) => void;
  contractType: UopContractType;
  onContractTypeChange: (type: UopContractType) => void;
  options: UopOptionsState;
  onOptionsChange: (options: UopOptionsState) => void;
}

export const CalculatorInput: React.FC<CalculatorInputProps> = ({
  value,
  onValueChange,
  calcDirection,
  onCalcDirectionChange,
  contractType,
  onContractTypeChange,
  options,
  onOptionsChange
}) => {
  // Obsługa zmian opcji
  const handleOptionChange = (key: keyof UopOptionsState, value: any) => {
    onOptionsChange({ ...options, [key]: value });
  };

  // Obsługa zmiany typu umowy
  const handleContractTypeChange = (value: string) => {
    onContractTypeChange(value as UopContractType);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* Typ umowy */}
        <div className="space-y-2">
          <Label htmlFor="contract-type">Typ umowy</Label>
          <Select 
            value={contractType} 
            onValueChange={handleContractTypeChange}
          >
            <SelectTrigger id="contract-type">
              <SelectValue placeholder="Wybierz typ umowy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pracaUop">Umowa o pracę</SelectItem>
              <SelectItem value="zlecenie">Umowa zlecenie</SelectItem>
              <SelectItem value="dzielo">Umowa o dzieło</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kwota i kierunek obliczeń */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="amount" className="mb-1.5 block">
              Kwota wynagrodzenia ({calcDirection === 'netto' ? 'Netto' : 'Brutto'})
            </Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder={`Wpisz kwotę wynagrodzenia`} 
              value={value === 0 ? '' : value} 
              onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div>
            <Label htmlFor="calc-direction" className="mb-1.5 block">Typ kwoty</Label>
            <Select 
              value={calcDirection} 
              onValueChange={onCalcDirectionChange}
            >
              <SelectTrigger id="calc-direction">
                <SelectValue placeholder="Wybierz typ..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brutto">Brutto</SelectItem>
                <SelectItem value="netto">Netto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Opcje specyficzne dla umowy o pracę */}
        {contractType === "pracaUop" && (
          <div className="space-y-4">
            {/* Wiek pracownika */}
            <div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="under-26"
                  checked={options.age === "under26"}
                  onChange={(e) => handleOptionChange('age', e.target.checked ? "under26" : "over26")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <Label htmlFor="under-26" className="text-sm font-normal cursor-pointer">
                  Pracownik do 26 roku życia (zerowy PIT dla młodych)
                </Label>
              </div>
            </div>

            {/* Opcje podatku */}
            <div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="pit2" 
                    checked={options.isPit2}
                    onChange={(e) => handleOptionChange('isPit2', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <Label htmlFor="pit2" className="text-sm font-normal cursor-pointer">
                    PIT-2 (kwota wolna 300 zł)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="outside-city" 
                    checked={options.isOutsideCity}
                    onChange={(e) => handleOptionChange('isOutsideCity', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <Label htmlFor="outside-city" className="text-sm font-normal cursor-pointer">
                    Praca poza miejscem zamieszkania
                  </Label>
                </div>
              </div>
            </div>

            {/* PPK */}
            <div>
              <Label className="mb-1.5 block">PPK (Pracowniczy Plan Kapitałowy)</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="ppk" 
                    checked={options.uopPpk}
                    onChange={(e) => handleOptionChange('uopPpk', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <Label htmlFor="ppk" className="text-sm font-normal cursor-pointer">
                    Uczestnictwo w PPK
                  </Label>
                </div>

                {options.uopPpk && (
                  <div className="mt-2">
                    <Label htmlFor="ppk-rate" className="mb-1.5 block text-sm">
                      Składka pracownika na PPK
                    </Label>
                    <Select 
                      value={options.uopPpkRate} 
                      onValueChange={(value) => handleOptionChange('uopPpkRate', value)}
                    >
                      <SelectTrigger id="ppk-rate" className="w-full">
                        <SelectValue placeholder="Wybierz składkę..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PPK_RATES.map(rate => (
                          <SelectItem key={rate} value={rate}>{rate}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Składka pracodawcy: 1.5% wynagrodzenia
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stawka wypadkowa */}
            <div>
              <Label htmlFor="accident-rate" className="mb-1.5 block">Składka wypadkowa</Label>
              <Select 
                value={options.uopAccidentRate} 
                onValueChange={(value) => handleOptionChange('uopAccidentRate', value)}
              >
                <SelectTrigger id="accident-rate">
                  <SelectValue placeholder="Wybierz stawkę..." />
                </SelectTrigger>
                <SelectContent>
                  {ACCIDENT_RATES.map(rate => (
                    <SelectItem key={rate} value={rate}>{rate}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Różna w zależności od branży, opłacana przez pracodawcę
              </p>
            </div>
          </div>
        )}
        
        {/* Opcje dla umowy zlecenie */}
        {contractType === "zlecenie" && (
          <div className="space-y-4">
            {/* Wiek zleceniobiorcy */}
            <div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="under-26-zlecenie"
                  checked={options.age === "under26"}
                  onChange={(e) => handleOptionChange('age', e.target.checked ? "under26" : "over26")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <Label htmlFor="under-26-zlecenie" className="text-sm font-normal cursor-pointer">
                  Zleceniobiorca do 26 roku życia (zerowy PIT dla młodych)
                </Label>
              </div>
            </div>

            {/* Składki ZUS */}
            <div>
              <Label className="mb-1.5 block">Składki ZUS</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="emerytalne" 
                    checked={options.zlecenieEmerytalne}
                    onChange={(e) => handleOptionChange('zlecenieEmerytalne', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <Label htmlFor="emerytalne" className="text-sm font-normal cursor-pointer">
                    Składka emerytalna i rentowa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="chorobowe" 
                    checked={options.zlecenieChorobowe}
                    onChange={(e) => handleOptionChange('zlecenieChorobowe', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <Label htmlFor="chorobowe" className="text-sm font-normal cursor-pointer">
                    Składka chorobowa
                  </Label>
                </div>
              </div>
            </div>

            {/* PIT-2 */}
            <div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="pit2-zlecenie" 
                  checked={options.isPit2}
                  onChange={(e) => handleOptionChange('isPit2', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <Label htmlFor="pit2-zlecenie" className="text-sm font-normal cursor-pointer">
                  PIT-2 (kwota wolna 300 zł)
                </Label>
              </div>
            </div>
          </div>
        )}
        
        {/* Opcje dla umowy o dzieło */}
        {contractType === "dzielo" && (
          <div className="space-y-4">
            {/* Wiek wykonawcy */}
            <div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="under-26-dzielo"
                  checked={options.age === "under26"}
                  onChange={(e) => handleOptionChange('age', e.target.checked ? "under26" : "over26")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <Label htmlFor="under-26-dzielo" className="text-sm font-normal cursor-pointer">
                  Wykonawca do 26 roku życia (zerowy PIT dla młodych)
                </Label>
              </div>
            </div>

            {/* Sytuacja wykonawcy */}
            <div>
              <Label htmlFor="dzielo-sytuacja" className="mb-1.5 block">Sytuacja wykonawcy</Label>
              <Select 
                value={options.dzieloSytuacja || "standard"} 
                onValueChange={(value) => handleOptionChange('dzieloSytuacja', value)}
              >
                <SelectTrigger id="dzielo-sytuacja">
                  <SelectValue placeholder="Wybierz..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standardowa umowa o dzieło</SelectItem>
                  <SelectItem value="ta-sama-firma">Umowa z własnym pracodawcą</SelectItem>
                  <SelectItem value="student">Uczeń/student do 26 lat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Koszty uzyskania przychodu */}
            <div>
              <Label htmlFor="dzielo-koszty" className="mb-1.5 block">Koszty uzyskania przychodu</Label>
              <Select 
                value={options.dzieloKoszty || "50"} 
                onValueChange={(value) => handleOptionChange('dzieloKoszty', value)}
              >
                <SelectTrigger id="dzielo-koszty">
                  <SelectValue placeholder="Wybierz..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20% kosztów uzyskania</SelectItem>
                  <SelectItem value="50">50% kosztów uzyskania</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                50% - dla prac o charakterze twórczym
              </p>
            </div>

            {/* PIT-2 */}
            <div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="pit2-dzielo" 
                  checked={options.isPit2}
                  onChange={(e) => handleOptionChange('isPit2', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <Label htmlFor="pit2-dzielo" className="text-sm font-normal cursor-pointer">
                  PIT-2 (kwota wolna 300 zł)
                </Label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
