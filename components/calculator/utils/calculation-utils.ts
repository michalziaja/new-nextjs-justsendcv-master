// Funkcje pomocnicze do obliczeń

import { 
    roundToInt, 
    roundToCent 
} from './formatters';
import { 
    RAISE_PERCENTAGES,
    PENSION_RATE,
    EMPLOYER_PENSION_RATE,
    DISABILITY_RATE,
    EMPLOYER_DISABILITY_RATE,
    SICKNESS_RATE,
    HEALTH_RATE,
    LABOR_FUND_RATE,
    FGSP_RATE,
    STANDARD_COST,
    INCREASED_COST,
    TAX_RATE,
    TAX_REDUCTION,
    EMPLOYER_PPK_DEFAULT
} from '../data/constants';
import { 
    CalculationResults, 
    RaiseResult,
    EmployeeContributions,
    EmployerContributions
} from './types';

/**
 * Oblicza wyniki dla różnych procentów podwyżki.
 * @param grossAmount Kwota brutto
 * @param netAmount Kwota netto
 * @param calculateNet Funkcja do obliczania netto z brutto
 * @returns Tablica obiektów z wynikami dla różnych procentów podwyżki
 */
export const calculateRaiseResults = (
    grossAmount: number, 
    netAmount: number,
    calculateNet: (gross: number) => number
): RaiseResult[] => {
    return RAISE_PERCENTAGES.map(percent => {
        const percentMultiplier = 1 + percent / 100;
        const newGross = roundToCent(grossAmount * percentMultiplier);
        const newNet = calculateNet(newGross);
        
        return {
            percent,
            newGross,
            newNet,
            monthlyNetIncrease: roundToCent(newNet - netAmount),
            yearlyNetIncrease: roundToCent((newNet - netAmount) * 12)
        };
    });
};

/**
 * Oblicza wartości półroczne i roczne.
 * @param grossAmount Kwota brutto
 * @param netAmount Kwota netto
 * @returns Obiekt z wartościami półrocznymi i rocznymi
 */
export const calculatePeriodAmounts = (grossAmount: number, netAmount: number) => {
    return {
        halfYearlyGross: roundToCent(grossAmount * 6),
        yearlyGross: roundToCent(grossAmount * 12),
        halfYearlyNet: roundToCent(netAmount * 6),
        yearlyNet: roundToCent(netAmount * 12)
    };
};

/**
 * Oblicza składki pracownika na podstawie podstawy wymiaru.
 * @param basis Podstawa wymiaru składek
 * @param includeSickness Czy uwzględnić składkę chorobową
 * @returns Obiekt ze składkami
 */
export const calculateEmployeeContributions = (
    basis: number, 
    includeSickness = true
): Pick<EmployeeContributions, 'pension' | 'disability' | 'sickness'> => {
    const pension = roundToCent(basis * PENSION_RATE);
    const disability = roundToCent(basis * DISABILITY_RATE);
    const sickness = includeSickness ? roundToCent(basis * SICKNESS_RATE) : 0;
    
    return { pension, disability, sickness };
};

/**
 * Oblicza składkę zdrowotną na podstawie podstawy wymiaru.
 * @param basis Podstawa wymiaru składki zdrowotnej
 * @returns Kwota składki zdrowotnej
 */
export const calculateHealthContribution = (basis: number): number => {
    return roundToCent(basis * HEALTH_RATE);
};

/**
 * Oblicza podatek dochodowy.
 * @param taxBasis Podstawa opodatkowania
 * @param hasTaxReduction Czy uwzględnić kwotę zmniejszającą podatek
 * @returns Kwota podatku
 */
export const calculateIncomeTax = (taxBasis: number, hasTaxReduction = false): number => {
    let tax = roundToCent(taxBasis * TAX_RATE);
    
    if (hasTaxReduction) {
        tax = Math.max(0, tax - TAX_REDUCTION);
    }
    
    return roundToInt(tax); // Zaokrąglenie do pełnych złotych
};

/**
 * Oblicza składki pracodawcy.
 * @param basis Podstawa wymiaru składek
 * @param accidentRate Stawka wypadkowa
 * @returns Obiekt ze składkami pracodawcy
 */
export const calculateEmployerContributions = (
    basis: number, 
    accidentRate: number
): Pick<EmployerContributions, 'pension' | 'disability' | 'accident' | 'fp' | 'fgsp'> => {
    const pension = roundToCent(basis * EMPLOYER_PENSION_RATE);
    const disability = roundToCent(basis * EMPLOYER_DISABILITY_RATE);
    const accident = roundToCent(basis * accidentRate / 100); // accidentRate jest w procentach
    const fp = roundToCent(basis * LABOR_FUND_RATE);
    const fgsp = roundToCent(basis * FGSP_RATE);
    
    return { pension, disability, accident, fp, fgsp };
};

/**
 * Oblicza składki PPK dla pracownika i pracodawcy.
 * @param gross Kwota brutto
 * @param employeeRate Stawka składki pracownika
 * @returns Obiekt z kwotami składek PPK
 */
export const calculatePpkContributions = (
    gross: number, 
    employeeRate: number
): { employee: number; employer: number } => {
    const employeePpk = roundToCent(gross * employeeRate / 100); // employeeRate jest w procentach
    const employerPpk = roundToCent(gross * EMPLOYER_PPK_DEFAULT);
    
    return { employee: employeePpk, employer: employerPpk };
};
