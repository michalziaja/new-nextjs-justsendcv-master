import { B2BCalculationOptions, B2BCalculationResult, calculateB2BSalary } from "../core/b2b-calculator";
import { CalculationResults } from "./types";
import { calculatePeriodAmounts, calculateRaiseResults } from "./calculation-utils";

export function convertB2BToCalculationResults(
  revenueWithVat: number, // Przychód brutto (z VAT), który będzie traktowany jako "grossAmount" w CalculationResults
  netProfit: number,      // Ostateczny zysk na rękę, który będzie "netAmount"
  options: B2BCalculationOptions,
  b2bCoreResult: B2BCalculationResult
): CalculationResults {

  const totalSocialContributions = 
    b2bCoreResult.zusContributions.pension +
    b2bCoreResult.zusContributions.disability +
    b2bCoreResult.zusContributions.sickness + 
    b2bCoreResult.zusContributions.accident + // Wypadkowa jest częścią składek społecznych
    b2bCoreResult.zusContributions.workFund;  // Fundusz pracy również

  // "employeeContributions" w kontekście B2B będą reprezentować wszystkie koszty firmy:
  // ZUS społeczne, zdrowotna, podatek PIT. VAT jest osobno.
  const employeeContributions = {
    pension: b2bCoreResult.zusContributions.pension,
    disability: b2bCoreResult.zusContributions.disability,
    sickness: b2bCoreResult.zusContributions.sickness,
    health: b2bCoreResult.zusContributions.health,
    tax: b2bCoreResult.tax, // Podatek PIT
    ppk: 0, // PPK nie dotyczy B2B
  };

  // W B2B "employerContributions" nie mają zastosowania w tradycyjnym sensie.
  // Można je zostawić jako zerowe lub pominąć.
  const employerContributions = {
    pension: 0,
    disability: 0,
    accident: 0,
    fp: 0,
    fgsp: 0,
    ppk: 0,
  };

  // "totalEmployerCost" w B2B to po prostu przychód brutto (z VAT), 
  // bo to jest całkowity koszt, który "generuje" ten przychód.
  // Alternatywnie, jeśli chcemy pokazać "koszt uzyskania przychodu" (ZUS + PIT + koszty firmy), to trzeba by to inaczej zdefiniować.
  // Dla spójności z UoP, gdzie totalEmployerCost to koszt pracodawcy ponad brutto, tutaj może to być mniej intuicyjne.
  // Na razie, dla uproszczenia, możemy przyjąć, że jest to kwota przychodu z VAT.
  const totalEmployerCost = revenueWithVat;

  const periodAmounts = calculatePeriodAmounts(revenueWithVat, netProfit); // Używamy przychodu z VAT i zysku netto
  
  // Funkcja do symulacji obliczenia netto dla podwyżek - musi być dostosowana do logiki B2B
  const calculateNetForRaiseB2B = (newGrossRevenueWithVat: number): number => {
    const vatMultiplier = 1 + parseFloat(options.vatRate) / 100;
    const grossRevenueForCalc = newGrossRevenueWithVat / vatMultiplier;
    const tempResult = calculateB2BSalary(grossRevenueForCalc, options);
    return tempResult.netAmount;
  };

  const raiseResults = calculateRaiseResults(revenueWithVat, netProfit, calculateNetForRaiseB2B);

  return {
    grossAmount: revenueWithVat, // Na wykresie to będzie "przychód brutto (z VAT)"
    netAmount: netProfit,        // Na wykresie to będzie "zysk na czysto"
    employeeContributions,
    employerContributions,
    totalEmployerCost,
    raiseResults,
    basis: {
      socialContributionsBasis: b2bCoreResult.basis.zusBasis, // Lub bardziej szczegółowo, jeśli trzeba
      healthContributionBasis: b2bCoreResult.basis.zusBasis, // Podstawa wymiaru składki zdrowotnej
      taxBasis: b2bCoreResult.basis.taxBasis,             // Podstawa opodatkowania PIT
    },
    ...periodAmounts,
    // Pola specyficzne dla B2B, które pie-chart może chcieć użyć bezpośrednio
    vatAmount: revenueWithVat - b2bCoreResult.netRevenue, // Obliczony VAT
    businessCosts: b2bCoreResult.costs,                  // Koszty działalności (te wpisane przez usera)
    // Dodatkowe pola ZUS, jeśli legenda ma je pokazywać osobno, a nie tylko sumę w employeeContributions
    // Na przykład, jeśli legenda ma pozycję "Składki ZUS (społeczne)" i "Składka zdrowotna" osobno.
    // W `b2bMonthlyData` w pie-chart.tsx mamy: 
    // name: "Składki ZUS" (suma społecznych bez zdrowotnej) - To wymaga korekty w pie-chart
    // name: "Składka zdrowotna" (osobno)
    // Dlatego przekazujemy je tutaj:
    accidentInsurance: b2bCoreResult.zusContributions.accident, // Składka wypadkowa
    workFund: b2bCoreResult.zusContributions.workFund,       // Fundusz Pracy
    // suma składek społecznych (bez zdrowotnej) dla legendy pie-chart
    totalSocialSecurityContributions: totalSocialContributions 
  };
} 