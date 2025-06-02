// Typy podstawowe używane w całym kalkulatorze

export type CalculationMode = "uop" | "b2b";
export type UopContractType = "pracaUop" | "zlecenie" | "dzielo";
export type B2bTaxType = "skala" | "liniowy" | "ryczalt";
export type B2bZusType = "pelny" | "preferencyjny" | "maly";
export type B2bTaxBracket = "pierwszy" | "drugi";

// Interfejsy dla składek i obciążeń
export interface EmployeeContributions { 
    pension: number;      // emerytalne
    disability: number;   // rentowe 
    sickness: number;     // chorobowe
    health: number;       // zdrowotne
    tax: number;          // podatek
    ppk?: number;         // PPK
}

export interface EmployerContributions { 
    pension: number;      // emerytalne
    disability: number;   // rentowe
    accident: number;     // wypadkowe
    fp: number;           // fundusz pracy
    fgsp: number;         // FGŚP
    ppk?: number;         // PPK pracodawcy
}

export interface RaiseResult { 
    percent: number; 
    newGross: number; 
    newNet: number; 
    monthlyNetIncrease: number; 
    yearlyNetIncrease: number; 
}

// Główny interfejs wyników obliczeń
export interface CalculationResults {
    netAmount: number;
    grossAmount: number;
    employeeContributions: EmployeeContributions;
    employerContributions: EmployerContributions;
    totalEmployerCost: number;
    halfYearlyNet: number;
    yearlyNet: number;
    halfYearlyGross: number;
    yearlyGross: number;
    raiseResults: RaiseResult[];
    basis: {
        socialContributionsBasis: number;
        healthContributionBasis: number;
        taxBasis: number;
    };
    // Opcjonalne pola specyficzne dla B2B
    vatAmount?: number;           // Kwota VAT
    businessCosts?: number;       // Koszty uzyskania przychodu
    accidentInsurance?: number;   // Ubezpieczenie wypadkowe
    workFund?: number;           // Fundusz pracy
    totalSocialSecurityContributions?: number; // Nowe pole dla sumy składek społecznych B2B (bez zdrowotnej)
}

// Interfejs opcji dla umowy o pracę
export interface UopOptionsState { 
    uopUlga: boolean; 
    uopPpk: boolean;
    uopPpkRate: string;
    age: string;
    isPit2: boolean;
    isOutsideCity: boolean;
    uopAccidentRate: string; 
    zlecenieEmerytalne: boolean; 
    zlecenieRentowe: boolean; 
    zlecenieChorobowe: boolean; 
    dzieloKoszty: string;
    calcDirection: string;
    zlecenieSytuacja?: string; // Sytuacja zawodowa zleceniobiorcy
    zlecenieZdrowotne?: boolean; // Składka zdrowotna
    zlecenieKUP?: string; // Koszty uzyskania przychodu: "20" lub "50" (procent)
    dzieloSytuacja?: string; // Sytuacja zawodowa wykonawcy dzieła
}

// Interfejs opcji dla działalności gospodarczej (B2B)
export interface B2bOptionsState { 
    b2bZus: B2bZusType; 
    b2bCosts: number; 
    b2bBracket: B2bTaxBracket; 
    b2bRyczaltRate: string;
    calcDirection?: string;
}

// Domyślne wartości dla wyników
export const defaultResults: CalculationResults = {
    netAmount: 0,
    grossAmount: 0,
    employeeContributions: { pension: 0, disability: 0, sickness: 0, health: 0, tax: 0, ppk: 0 },
    employerContributions: { pension: 0, disability: 0, accident: 0, fp: 0, fgsp: 0, ppk: 0 },
    totalEmployerCost: 0,
    halfYearlyNet: 0,
    yearlyNet: 0,
    halfYearlyGross: 0,
    yearlyGross: 0,
    raiseResults: [],
    basis: {
        socialContributionsBasis: 0,
        healthContributionBasis: 0,
        taxBasis: 0
    },
    // Pola B2B
    vatAmount: 0,
    businessCosts: 0,
    accidentInsurance: 0,
    workFund: 0,
    totalSocialSecurityContributions: 0
};
