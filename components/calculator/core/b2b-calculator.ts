// Typy kalkulatora B2B
export interface B2BCalculationOptions {
  taxType: "ogolne" | "liniowy";
  vatRate: "0" | "5" | "8" | "23";
  costs: number;
  zusType: "pelny" | "preferencyjny" | "maly";
  hasUlgaIPBox: boolean;
  hasPIT0: boolean;
  age?: "under26" | "over26";
}

export interface B2BCalculationResult {
  // Przychody i koszty
  grossRevenue: number;
  netRevenue: number; // po VAT
  costs: number;
  income: number; // przychód - koszty
  
  // ZUS
  zusContributions: {
    pension: number;
    disability: number;
    sickness: number;
    health: number;
    accident: number;
    workFund: number;
    total: number;
  };
  
  // Podatek
  taxableIncome: number;
  tax: number;
  
  // Finalne wartości
  netAmount: number; // ostateczny zysk
  effectiveTaxRate: number;
  
  // Podstawy obliczeniowe
  basis: {
    taxBasis: number;
    zusBasis: number;
  };
}

// Stałe dla ZUS 2025
const ZUS_RATES = {
  PENSION: 0.1952, // emerytalna 19,52%
  DISABILITY: 0.08, // rentowa 8%  
  SICKNESS: 0.0245, // chorobowa 2,45%
  ACCIDENT: 0.0167, // wypadkowa 1,67%
  HEALTH: 0.09, // zdrowotna 9%
  WORK_FUND: 0.0245 // fundusz pracy 2,45%
};

// Minimalne wynagrodzenie 2025
const MIN_WAGE_2025 = 4666;

// Podstawy składek ZUS 2025 (aktualne wartości)
const ZUS_BASES_2025 = {
  PELNY: {
    pension: 5203.80, // 60% prognozowanego przeciętnego wynagrodzenia
    disability: 5203.80,
    sickness: 5203.80,
    health: 5203.80,
    accident: 5203.80,
    workFund: 5203.80
  },
  PREFERENCYJNY: {
    pension: 1399.80, // 30% minimalnego wynagrodzenia
    disability: 1399.80,
    sickness: 1399.80,
    health: 1399.80,
    accident: 1399.80,
    workFund: 0 // Fundusz Pracy = 0% dla preferencyjnych składek
  },
  MALY: {
    // Mały ZUS Plus - podstawa zależy od dochodu z poprzedniego roku
    // Minimalna podstawa to 1399,80 zł, maksymalna 5203,80 zł
    // Dla uproszczenia przyjmujemy średnią około 50% maksymalnej
    pension: 2600, // przybliżona średnia podstawa
    disability: 2600,
    sickness: 2600,
    health: 2600,
    accident: 2600,
    workFund: 2600
  }
};

// Progi podatkowe 2025
const TAX_THRESHOLDS = {
  FIRST_THRESHOLD: 120000, // do 120k - 12%
  SECOND_RATE: 0.32 // powyżej 120k - 32%
};

// Kwota wolna od podatku 2025
const TAX_FREE_AMOUNT = 30000;

/**
 * Oblicza składki ZUS dla B2B
 */
function calculateZUSContributions(zusType: "pelny" | "preferencyjny" | "maly", taxType: "ogolne" | "liniowy", income?: number): B2BCalculationResult['zusContributions'] {
  const bases = ZUS_BASES_2025[zusType.toUpperCase() as keyof typeof ZUS_BASES_2025];
  
  const pension = bases.pension * ZUS_RATES.PENSION;
  const disability = bases.disability * ZUS_RATES.DISABILITY;
  const sickness = bases.sickness * ZUS_RATES.SICKNESS;
  const accident = bases.accident * ZUS_RATES.ACCIDENT;
  const workFund = bases.workFund * ZUS_RATES.WORK_FUND;
  
  // Składka zdrowotna - różne zasady dla skali i liniowego
  let health = 0;
  if (taxType === "liniowy") {
    // Dla podatku liniowego: 4,9% dochodu, minimum 314,96 zł miesięcznie
    const healthFromIncome = income ? income * 0.049 : 0;
    health = Math.max(314.96, healthFromIncome);
  } else {
    // Dla skali podatkowej: 9% dochodu, minimum 314,96 zł miesięcznie
    const healthFromIncome = income ? income * 0.09 : 0;
    health = Math.max(314.96, healthFromIncome);
  }
  
  return {
    pension: Math.round(pension * 100) / 100,
    disability: Math.round(disability * 100) / 100,
    sickness: Math.round(sickness * 100) / 100,
    health: Math.round(health * 100) / 100,
    accident: Math.round(accident * 100) / 100,
    workFund: Math.round(workFund * 100) / 100,
    total: Math.round((pension + disability + sickness + health + accident + workFund) * 100) / 100
  };
}

/**
 * Oblicza podatek dochodowy dla skali podatkowej
 */
function calculateProgressiveTax(taxableIncome: number, age?: "under26" | "over26"): number {
  // Zerowy PIT dla młodych do 85 528 zł rocznie (7127 zł miesięcznie)
  if (age === "under26" && taxableIncome <= 7127) {
    return 0;
  }
  
  // Odejmujemy kwotę wolną
  const baseForTax = Math.max(0, taxableIncome - TAX_FREE_AMOUNT / 12);
  
  if (baseForTax <= TAX_THRESHOLDS.FIRST_THRESHOLD / 12) {
    // 12% do progu
    return Math.round(baseForTax * 0.12 * 100) / 100;
  } else {
    // 12% do progu + 32% powyżej
    const firstPart = (TAX_THRESHOLDS.FIRST_THRESHOLD / 12) * 0.12;
    const secondPart = (baseForTax - TAX_THRESHOLDS.FIRST_THRESHOLD / 12) * TAX_THRESHOLDS.SECOND_RATE;
    return Math.round((firstPart + secondPart) * 100) / 100;
  }
}

/**
 * Oblicza podatek liniowy (19%)
 */
function calculateLinearTax(taxableIncome: number, age?: "under26" | "over26"): number {
  // Zerowy PIT dla młodych do 85 528 zł rocznie (7127 zł miesięcznie)
  if (age === "under26" && taxableIncome <= 7127) {
    return 0;
  }
  
  // Podatek liniowy bez kwoty wolnej
  return Math.round(taxableIncome * 0.19 * 100) / 100;
}

/**
 * Główna funkcja kalkulatora B2B
 */
export function calculateB2BSalary(grossRevenue: number, options: B2BCalculationOptions): B2BCalculationResult {
  // Walidacja danych wejściowych
  if (grossRevenue <= 0) {
    return {
      grossRevenue: 0,
      netRevenue: 0,
      costs: 0,
      income: 0,
      zusContributions: {
        pension: 0,
        disability: 0,
        sickness: 0,
        health: 0,
        accident: 0,
        workFund: 0,
        total: 0
      },
      taxableIncome: 0,
      tax: 0,
      netAmount: 0,
      effectiveTaxRate: 0,
      basis: {
        taxBasis: 0,
        zusBasis: 0
      }
    };
  }
  
  // Oblicz przychód netto (po VAT)
  const vatMultiplier = 1 + (parseFloat(options.vatRate) / 100);
  const netRevenue = Math.round((grossRevenue / vatMultiplier) * 100) / 100;
  
  // Oblicz dochód (przychód - koszty)
  const income = Math.max(0, netRevenue - options.costs);
  
  // Oblicz składki ZUS
  const zusContributions = calculateZUSContributions(options.zusType, options.taxType, income);
  
  // Podstawa opodatkowania (dochód - składki ZUS)
  const taxableIncome = Math.max(0, income - zusContributions.total);
  
  // Oblicz podatek
  let tax = 0;
  if (options.taxType === "ogolne") {
    tax = calculateProgressiveTax(taxableIncome, options.age);
  } else {
    tax = calculateLinearTax(taxableIncome, options.age);
  }
  
  // Ulga IP Box (5% zamiast standardowego podatku)
  if (options.hasUlgaIPBox) {
    tax = Math.round(taxableIncome * 0.05 * 100) / 100;
  }
  
  // PIT-0 dla powracających z zagranicy
  if (options.hasPIT0) {
    tax = 0;
  }
  
  // Końcowa kwota netto
  const netAmount = Math.max(0, taxableIncome - tax);
  
  // Efektywna stawka podatkowa
  const effectiveTaxRate = grossRevenue > 0 
    ? Math.round(((zusContributions.total + tax) / grossRevenue * 100) * 100) / 100
    : 0;
  
  return {
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    costs: Math.round(options.costs * 100) / 100,
    income: Math.round(income * 100) / 100,
    zusContributions,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    effectiveTaxRate,
    basis: {
      taxBasis: Math.round(taxableIncome * 100) / 100,
      zusBasis: Math.round(income * 100) / 100
    }
  };
}

/**
 * Oblicza wymagany przychód brutto dla danej kwoty netto
 */
export function calculateB2BBrutto(targetNet: number, options: B2BCalculationOptions): number {
  if (targetNet <= 0) return 0;
  
  // Iteracyjne przybliżenie przez bisekcję
  let min = targetNet;
  let max = targetNet * 3; // Maksymalne przybliżenie
  let result = 0;
  
  // Iteracje bisekcji
  for (let i = 0; i < 50; i++) {
    const mid = (min + max) / 2;
    const calc = calculateB2BSalary(mid, options);
    
    if (Math.abs(calc.netAmount - targetNet) < 0.01) {
      result = mid;
      break;
    }
    
    if (calc.netAmount < targetNet) {
      min = mid;
    } else {
      max = mid;
    }
    result = mid;
  }
  
  return Math.round(result * 100) / 100;
}
