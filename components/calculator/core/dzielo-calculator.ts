// Kalkulator dla umowy o dzieło
// Ten plik zawiera logikę obliczeniową dla umowy o dzieło

import { 
    roundToInt, 
    roundToCent 
} from '../utils/formatters';
import { UopOptionsState } from '../utils/types';

// Stałe dla umowy o dzieło
const TAX_RATE = 0.12;                  // podatek dochodowy 12%
const TAX_REDUCTION = 300;              // kwota zmniejszająca podatek miesięcznie
const COST_RATE_STANDARD = 0.20;       // standardowe koszty uzyskania przychodu (20%)
const COST_RATE_AUTHOR = 0.50;         // podwyższone koszty uzyskania przychodu (prawa autorskie, 50%)

/**
 * Oblicza wynagrodzenie netto dla umowy o dzieło.
 * @param gross Kwota brutto
 * @param options Opcje kalkulatora
 * @returns Obiekt z wynikami obliczeń
 */
export const calculateDzieloSalary = (
    gross: number,
    options: UopOptionsState
) => {
    // Parametry z opcji
    const isUnder26 = options.age === 'under26';
    const hasPit2 = options.isPit2;
    const dzieloSytuacja = options.dzieloSytuacja || "standard";
    const kupRate = options.dzieloKoszty === "50" ? COST_RATE_AUTHOR : COST_RATE_STANDARD;
    
    // W umowie o dzieło zazwyczaj nie ma składek ZUS
    // Wyjątkiem są sytuacje specjalne (ta sama firma, kolejna umowa)
    let pensionContribution = 0;
    let disabilityContribution = 0;
    let sicknessContribution = 0;
    let healthContribution = 0;
    let employeeSocialContributions = 0;
    
    // Składki ZUS tylko w określonych sytuacjach
    if (dzieloSytuacja === "ta-sama-firma") {
        // Jeśli umowa o dzieło z tym samym pracodawcą - mogą być składki
        // Na razie zostawiamy bez składek, można rozszerzyć w przyszłości
    }
    
    // Podstawa wymiaru składki zdrowotnej = gross - składki społeczne
    const healthContributionBasis = gross - employeeSocialContributions;
    
    // Koszty uzyskania przychodu
    const taxDeductibleCosts = roundToCent(healthContributionBasis * kupRate);
    
    // Podstawa opodatkowania = przychód - koszty uzyskania przychodu
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
    
    // Wynagrodzenie netto = brutto - składki - podatek
    const netAmount = roundToCent(gross - employeeSocialContributions - healthContribution - tax);
    
    // W umowie o dzieło koszt zleceniodawcy to zwykle sama kwota brutto
    const totalEmployerCost = gross;
    
    // Składki pracodawcy - w umowie o dzieło zazwyczaj brak
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
            ppk: 0  // W umowie o dzieło nie ma PPK
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
            socialContributionsBasis: 0, // Brak składek społecznych w standardowej umowie o dzieło
            healthContributionBasis,
            taxBasis
        }
    };
};

/**
 * Oblicza wynagrodzenie brutto dla podanego netto dla umowy o dzieło.
 * @param net Kwota netto
 * @param options Opcje kalkulatora
 * @param precision Dokładność obliczeń
 * @returns Obliczona kwota brutto
 */
export const calculateDzieloBrutto = (
    net: number,
    options: UopOptionsState,
    precision: number = 0.01
): number => {
    if (net <= 0) return 0;
    
    // Przybliżone początkowe brutto
    let low = net;
    let high = net * 2; // Przybliżona górna granica
    
    // Sprawdź czy górna granica jest wystarczająco wysoka
    let initialCheck = calculateDzieloSalary(high, options).netAmount;
    while (initialCheck < net) {
        high *= 1.5;
        initialCheck = calculateDzieloSalary(high, options).netAmount;
    }
    
    // Metoda bisekcji do znalezienia brutto
    let iterations = 0;
    const maxIterations = 50;
    
    while (high - low > precision && iterations < maxIterations) {
        const mid = (low + high) / 2;
        const result = calculateDzieloSalary(mid, options);
        
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