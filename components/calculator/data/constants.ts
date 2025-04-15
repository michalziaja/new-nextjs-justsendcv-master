// Stałe wartości używane w kalkulatorze

// Stawki procentowe dla podwyżki
export const RAISE_PERCENTAGES = [0, 5, 10, 15, 20, 25];

// Stawki PPK
export const PPK_RATES = ["0", "0.5", "2", "3", "4"];

// Stawki wypadkowe
export const ACCIDENT_RATES = ["1.67", "0.67", "1.0", "2.0", "3.33"];

// Minimalne wynagrodzenie 2025
export const MIN_WAGE_2025 = 4666;

// Stawki ZUS dla pracownika
export const PENSION_RATE = 0.0976;           // emerytalne pracownik
export const DISABILITY_RATE = 0.015;          // rentowe pracownik
export const SICKNESS_RATE = 0.0245;           // chorobowe pracownik
export const HEALTH_RATE = 0.09;               // zdrowotne

// Stawki ZUS dla pracodawcy
export const EMPLOYER_PENSION_RATE = 0.0976;   // emerytalne pracodawca
export const EMPLOYER_DISABILITY_RATE = 0.065; // rentowe pracodawca
export const LABOR_FUND_RATE = 0.0245;         // fundusz pracy 
export const FGSP_RATE = 0.001;                // Fundusz Gwarantowanych Świadczeń Pracowniczych

// Stawki podatkowe
export const TAX_RATE = 0.12;                 // podatek dochodowy 12%
export const TAX_REDUCTION = 300;             // kwota zmniejszająca podatek miesięcznie (1/12 z 3600 zł)

// Koszty uzyskania przychodu
export const STANDARD_COST = 250;             // koszty uzyskania przychodu standardowe
export const INCREASED_COST = 300;            // koszty uzyskania przychodu podwyższone

// Stawki PPK
export const EMPLOYEE_PPK_DEFAULT = 0.02;     // domyślna składka pracownika PPK (2%)
export const EMPLOYER_PPK_DEFAULT = 0.015;    // domyślna składka pracodawcy PPK (1.5%)

// Stawki dla B2B
export const B2B_LINEAR_TAX = 0.19;           // podatek liniowy 19%
export const B2B_SCALE_TAX_FIRST = 0.12;      // pierwsza stawka skali podatkowej 12%
export const B2B_SCALE_TAX_SECOND = 0.32;     // druga stawka skali podatkowej 32%
export const B2B_TAX_THRESHOLD = 120000;      // próg podatkowy dla skali podatkowej 