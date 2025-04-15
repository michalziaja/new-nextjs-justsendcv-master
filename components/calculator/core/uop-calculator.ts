// Kalkulator dla umowy o pracę
// Ten plik zawiera logikę obliczeniową dla umowy o pracę

import { 
    roundToInt, 
    roundToCent 
} from '../utils/formatters';
import { UopOptionsState } from '../utils/types';

// Stałe
const PENSION_RATE = 0.0976;           // emerytalne pracownik
const DISABILITY_RATE = 0.015;          // rentowe pracownik 
const EMPLOYER_DISABILITY_RATE = 0.065; // rentowe pracodawca
const SICKNESS_RATE = 0.0245;           // chorobowe
const HEALTH_RATE = 0.09;               // zdrowotne
const TAX_RATE = 0.12;                  // podatek dochodowy
const LABOR_FUND_RATE = 0.0245;         // fundusz pracy
const FGSP_RATE = 0.001;                // Fundusz Gwarantowanych Świadczeń Pracowniczych
const STANDARD_COST = 250;              // koszty uzyskania przychodu standardowe
const INCREASED_COST = 300;             // koszty uzyskania przychodu podwyższone
const TAX_REDUCTION = 300;              // kwota zmniejszająca podatek miesięcznie

/**
 * Oblicza wynagrodzenie netto dla umowy o pracę.
 * @param gross Kwota brutto
 * @param options Opcje kalkulatora
 * @returns Obiekt z wynikami obliczeń
 */
export const calculateUopSalary = (
    gross: number,
    options: UopOptionsState
) => {
    // Parametry z opcji
    const isUnder26 = options.age === 'under26';
    const hasIncreasedCost = options.isOutsideCity;
    const hasPit2 = options.isPit2;
    const ppkRate = parseFloat(options.uopPpkRate) / 100;
    const accidentRate = parseFloat(options.uopAccidentRate) / 100;
    const hasPpk = options.uopPpk && ppkRate > 0;
    
    // Podstawa wymiaru składek społecznych
    const socialContributionsBasis = gross;
    
    // Składki pracownika na ubezpieczenia społeczne
    const pensionContribution = roundToCent(socialContributionsBasis * PENSION_RATE);
    const disabilityContribution = roundToCent(socialContributionsBasis * DISABILITY_RATE);
    const sicknessContribution = roundToCent(socialContributionsBasis * SICKNESS_RATE);
    const employeeSocialContributions = pensionContribution + disabilityContribution + sicknessContribution;
    
    // Podstawa wymiaru składki zdrowotnej
    const healthContributionBasis = roundToCent(gross - employeeSocialContributions);
    const healthContribution = roundToCent(healthContributionBasis * HEALTH_RATE);
    
    // Koszty uzyskania przychodu
    const taxDeductibleCosts = hasIncreasedCost ? INCREASED_COST : STANDARD_COST;
    
    // Podstawa opodatkowania
    let taxBasis = Math.max(0, gross - employeeSocialContributions - taxDeductibleCosts);
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
    
    // Składka PPK pracownika
    let ppkContribution = 0;
    if (hasPpk) {
        ppkContribution = roundToCent(gross * ppkRate);
    }
    
    // Wynagrodzenie netto
    const netAmount = roundToCent(gross - employeeSocialContributions - healthContribution - tax - ppkContribution);
    
    // Składki pracodawcy
    const employerPensionContribution = roundToCent(socialContributionsBasis * PENSION_RATE);
    const employerDisabilityContribution = roundToCent(socialContributionsBasis * EMPLOYER_DISABILITY_RATE);
    const accidentContribution = roundToCent(socialContributionsBasis * accidentRate);
    const laborFundContribution = roundToCent(socialContributionsBasis * LABOR_FUND_RATE);
    const fgspContribution = roundToCent(socialContributionsBasis * FGSP_RATE);
    
    // Składka PPK pracodawcy (standardowo 1.5%)
    let employerPpkContribution = 0;
    if (hasPpk) {
        employerPpkContribution = roundToCent(gross * 0.015); // standardowa składka pracodawcy 1.5%
    }
    
    // Łączny koszt pracodawcy
    const totalEmployerCost = roundToCent(gross + employerPensionContribution + employerDisabilityContribution + 
        accidentContribution + laborFundContribution + fgspContribution + employerPpkContribution);
    
    return {
        netAmount,
        employeeContributions: {
            pension: pensionContribution,
            disability: disabilityContribution,
            sickness: sicknessContribution,
            health: healthContribution,
            tax,
            ppk: ppkContribution
        },
        employerContributions: {
            pension: employerPensionContribution,
            disability: employerDisabilityContribution,
            accident: accidentContribution,
            fp: laborFundContribution,
            fgsp: fgspContribution,
            ppk: employerPpkContribution
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
 * Oblicza wynagrodzenie brutto dla podanego netto dla umowy o pracę.
 * @param net Kwota netto
 * @param options Opcje kalkulatora
 * @param precision Dokładność obliczeń
 * @returns Obliczona kwota brutto
 */
export const calculateUopBrutto = (
    net: number,
    options: UopOptionsState,
    precision: number = 0.01
): number => {
    if (net <= 0) return 0;
    
    // Przybliżone początkowe brutto
    let low = net;
    let high = net * 2; // Przybliżona górna granica
    
    // Sprawdź czy górna granica jest wystarczająco wysoka
    let initialCheck = calculateUopSalary(high, options).netAmount;
    while (initialCheck < net) {
        high *= 1.5;
        initialCheck = calculateUopSalary(high, options).netAmount;
    }
    
    // Metoda bisekcji do znalezienia brutto
    let iterations = 0;
    const maxIterations = 50;
    
    while (high - low > precision && iterations < maxIterations) {
        const mid = (low + high) / 2;
        const result = calculateUopSalary(mid, options);
        
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
