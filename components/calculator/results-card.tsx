"use client";

import { formatCurrency } from "./utils/formatters";
import { CalculationResults } from "./utils/types";

// Interfejs dla komponentu wyświetlającego wyniki
interface ResultsCardProps {
  results: CalculationResults;
  calcDirection: string;
  isB2B?: boolean; // Nowy prop do oznaczenia, czy to B2B
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ 
  results, 
  calcDirection, 
  isB2B = false 
}) => {
  // Obliczenie łącznych obciążeń pracownika/przedsiębiorcy (wszystkie składki + podatek)
  const totalEmployeeDeductions = 
    results.employeeContributions.pension +
    results.employeeContributions.disability +
    results.employeeContributions.sickness +
    results.employeeContributions.health +
    results.employeeContributions.tax +
    (results.employeeContributions.ppk || 0);

  // Procent obciążeń od kwoty brutto/przychodu
  const deductionsPercent = results.grossAmount > 0 
    ? (totalEmployeeDeductions / results.grossAmount * 100).toFixed(1) 
    : "0.0";

  const grossLabel = isB2B ? "Przychód brutto" : "Kwota brutto";
  const netLabel = isB2B ? "Zysk netto" : "Kwota netto";
  const grossDescription = isB2B 
    ? (calcDirection === 'netto' 
       ? `Wymagany przychód dla ${formatCurrency(results.netAmount)} zysku`
       : `Przychód przed odliczeniem kosztów, ZUS i podatku`)
    : (calcDirection === 'netto' 
       ? `Wymagane brutto dla ${formatCurrency(results.netAmount)} netto`
       : `Kwota przed odliczeniem składek i podatku`);
  
  const netDescription = isB2B 
    ? `Obciążenia: ${formatCurrency(totalEmployeeDeductions)} (${deductionsPercent}%)`
    : `Obciążenia: ${formatCurrency(totalEmployeeDeductions)} (${deductionsPercent}%)`;

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Kontener z kwotą brutto/przychód */}
      <div className="w-full h-[80px] bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border-t-6 border-green-500 flex flex-col justify-center px-4">
        <div className="text-base font-semibold text-center">
          {grossLabel}
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold bg-gradient-to-r  from-green-600 to-teal-600 bg-clip-text text-transparent">
            {formatCurrency(results.grossAmount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {grossDescription}
          </div>
        </div>
      </div>

      {/* Kontener z kwotą netto/zysk */}
      <div className="w-full h-[80px] bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border-t-6 border-[#00B2FF] flex flex-col justify-center px-4">
        <div className="text-base font-semibold text-center">
          {netLabel}
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#00B2FF] to-blue-600 bg-clip-text text-transparent">
            {formatCurrency(results.netAmount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {netDescription}
          </div>
        </div>
      </div>
    </div>
  );
};
