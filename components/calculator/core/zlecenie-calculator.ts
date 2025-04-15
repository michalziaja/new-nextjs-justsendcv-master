// Kalkulator dla umowy zlecenia
// Ten plik zawiera logikę obliczeniową dla umowy zlecenie

import { 
    roundToInt, 
    roundToCent 
} from '../utils/formatters';
import { UopOptionsState } from '../utils/types';

// Stałe
const PENSION_RATE = 0.0976;           // emerytalne
const DISABILITY_RATE = 0.015;          // rentowe
const SICKNESS_RATE = 0.0245;           // chorobowe
const HEALTH_RATE = 0.09;               // zdrowotna
const TAX_RATE = 0.12;                  // podatek dochodowy
const TAX_REDUCTION = 300;              // kwota zmniejszająca podatek miesięcznie
const COST_RATE_STANDARD = 0.20;        // standardowe koszty uzyskania przychodu dla zlecenia (20%)
const COST_RATE_AUTHOR = 0.50;          // podwyższone koszty uzyskania przychodu (prawa autorskie, 50%)

/**
 * Oblicza wynagrodzenie netto dla umowy zlecenia.
 * @param gross Kwota brutto
 * @param options Opcje kalkulatora
 * @returns Obiekt z wynikami obliczeń
 */
export const calculateZlecenieSalary = (
    gross: number,
    options: UopOptionsState
) => {
    // Parametry z opcji
    const isUnder26 = options.age === 'under26';
    const hasPit2 = options.isPit2;
    const hasEmerytalneRentowe = options.zlecenieEmerytalne; // Składki emerytalne i rentowe
    const hasChorobowe = options.zlecenieChorobowe;         // Składka chorobowa
    const hasZdrowotne = options.zlecenieZdrowotne !== false; // Składka zdrowotna (domyślnie true)
    const kupRate = options.zlecenieKUP === "50" ? COST_RATE_AUTHOR : COST_RATE_STANDARD;
    
    // Podstawa wymiaru składek społecznych
    const socialContributionsBasis = gross;
    
    // Składki na ubezpieczenia społeczne (tylko jeśli są zaznaczone)
    let pensionContribution = 0;
    let disabilityContribution = 0;
    let sicknessContribution = 0;
    let employeeSocialContributions = 0;
    
    if (hasEmerytalneRentowe) {
        pensionContribution = roundToCent(socialContributionsBasis * PENSION_RATE);
        disabilityContribution = roundToCent(socialContributionsBasis * DISABILITY_RATE);
        
        if (hasChorobowe) {
            sicknessContribution = roundToCent(socialContributionsBasis * SICKNESS_RATE);
        }
        
        employeeSocialContributions = pensionContribution + disabilityContribution + sicknessContribution;
    }
    
    // Podstawa wymiaru składki zdrowotnej
    const healthContributionBasis = gross - employeeSocialContributions;
    let healthContribution = 0;
    
    if (hasZdrowotne) {
        healthContribution = roundToCent(healthContributionBasis * HEALTH_RATE);
    }
    
    // Koszty uzyskania przychodu
    const taxDeductibleCosts = roundToCent(healthContributionBasis * kupRate);
    
    // Podstawa opodatkowania
    let taxBasis = Math.max(0, healthContributionBasis - taxDeductibleCosts);
    taxBasis = roundToInt(taxBasis); // zaokrąglenie do pełnych złotych
    
    // Podatek dochodowy
    let tax = 0;
    if (!isUnder26) {
        tax = roundToCent(taxBasis * TAX_RATE);
        if (hasPit2) {
            tax = Math.max(0, tax - TAX_REDUCTION);
        }
        tax = roundToInt(tax); // zaokrąglenie do pełnych złotych
    }
    
    // Wynagrodzenie netto
    const netAmount = roundToCent(gross - employeeSocialContributions - healthContribution - tax);
    
    // W umowie zlecenia koszt zleceniodawcy to zwykle sama kwota brutto
    // W tym uproszczonym modelu nie uwzględniamy składek pracodawcy
    const totalEmployerCost = gross;
    
    // Składki pracodawcy - w umowie zlecenia nie ma składek pracodawcy, więc zerujemy
    // Ale zostawiamy strukturę zgodną z interfejsem CalculationResults
    const employerPensionContribution = 0;
    const employerDisabilityContribution = 0;
    const accidentContribution = 0;
    const laborFundContribution = 0;
    const fgspContribution = 0;
    
    return {
        netAmount,
        employeeContributions: {
            pension: pensionContribution,
            disability: disabilityContribution,
            sickness: sicknessContribution,
            health: healthContribution,
            tax,
            ppk: 0  // W umowie zlecenia nie ma PPK
        },
        employerContributions: {
            pension: employerPensionContribution,
            disability: employerDisabilityContribution,
            accident: accidentContribution,
            fp: laborFundContribution,
            fgsp: fgspContribution,
            ppk: 0
        },
        totalEmployerCost,
        basis: {
            socialContributionsBasis,
            healthContributionBasis,
            taxBasis
        }
    };
};

/**
 * Oblicza wynagrodzenie brutto dla podanego netto dla umowy zlecenia.
 * @param net Kwota netto
 * @param options Opcje kalkulatora
 * @param precision Dokładność obliczeń
 * @returns Obliczona kwota brutto
 */
export const calculateZlecenieBrutto = (
    net: number,
    options: UopOptionsState,
    precision: number = 0.01
): number => {
    if (net <= 0) return 0;
    
    // Przybliżone początkowe brutto
    let low = net;
    let high = net * 2; // Przybliżona górna granica
    
    // Sprawdź czy górna granica jest wystarczająco wysoka
    let initialCheck = calculateZlecenieSalary(high, options).netAmount;
    while (initialCheck < net) {
        high *= 1.5;
        initialCheck = calculateZlecenieSalary(high, options).netAmount;
    }
    
    // Metoda bisekcji do znalezienia brutto
    let iterations = 0;
    const maxIterations = 50;
    
    while (high - low > precision && iterations < maxIterations) {
        const mid = (low + high) / 2;
        const result = calculateZlecenieSalary(mid, options);
        
        if (result.netAmount < net) {
            low = mid;
        } else {
            high = mid;
        }
        
        iterations++;
    }
    
    // Zaokrąglenie do 2 miejsc po przecinku
    return roundToCent((low + high) / 2);
}; 