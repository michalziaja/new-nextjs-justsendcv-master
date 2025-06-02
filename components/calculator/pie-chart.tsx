"use client";

import { PieChart as PieChartRechart, Pie, Cell } from "recharts";
import { CalculationResults } from "./utils/types";
import { formatCurrency } from "./utils/formatters";
import React from 'react';

interface PieChartProps {
  results: CalculationResults;
  activeTab?: "components" | "employer" | "yearly" | "monthly";
  isB2B?: boolean;
}

interface ChartItem {
  name: string;
  value: number;
  color: string;
  type: string;
}

export const PieChart = ({ 
  results, 
  activeTab = "components",
  isB2B = false 
}: PieChartProps): React.ReactElement => {
  const gradients = {
    netAmount: ["from-[#00B2FF]", "to-blue-600"],
    pension: ["from-purple-500", "to-purple-700"],
    disability: ["from-yellow-500", "to-yellow-700"],
    sickness: ["from-cyan-500", "to-cyan-700"],
    health: ["from-green-500", "to-green-700"],
    tax: ["from-red-500", "to-red-700"],
    costs: ["from-orange-500", "to-orange-700"],
    vat: ["from-pink-500", "to-pink-700"],
    fp: ["from-indigo-500", "to-indigo-700"]
  };

  // Dane dla podsumowania miesięcznego B2B - szczegółowa struktura
  const b2bMonthlyData: ChartItem[] = [
    {
      name: "Kwota brutto", 
      value: results.grossAmount, // Przychód z VAT
      color: "url(#netAmountGradient)",
      type: "positive"
    },
    {
      name: "Podatek VAT",
      value: results.vatAmount || 0,
      color: "url(#vatGradient)",
      type: "negative"
    },
    {
      name: "Składki ZUS (społeczne)", // Zaktualizowana nazwa dla jasności
      value: results.totalSocialSecurityContributions || 0, // Użycie nowego pola
      color: "url(#pensionGradient)", // Kolor dla ZUS społecznych
      type: "negative"
    },
    {
      name: "Koszt uzyskania przychodu", // To są koszty wpisane przez użytkownika
      value: results.businessCosts || 0,
      color: "url(#costsGradient)",
      type: "negative"
    },
    {
      name: "Składka zdrowotna",
      value: results.employeeContributions.health, // Użycie poprawnego pola dla składki zdrowotnej
      color: "url(#healthGradient)", // Osobny kolor dla składki zdrowotnej
      type: "negative"
    },
    {
      name: "Podatek PIT",
      value: results.employeeContributions.tax,
      color: "url(#taxGradient)",
      type: "negative"
    },
    {
      name: "Zysk na czysto",
      value: results.netAmount,
      color: "url(#netAmountGradient)", 
      type: "result"
    }
  ].filter(item => item.value !== 0 || item.name === "Zysk na czysto" || item.name === "Koszt uzyskania przychodu" || item.name === "Podatek VAT"); // Filtruj pozycje z wartością 0, ale zawsze pokazuj Zysk na czysto, Koszty i VAT

  // Dane dla B2B - ogólne (dla zakładki rocznej)
  const b2bData: ChartItem[] = [
    {
      name: "Twój zysk (kwota netto)",
      value: results.netAmount,
      color: "url(#netAmountGradient)",
      type: "positive"
    },
    {
      name: "Składki ZUS",
      value: results.employeeContributions.pension + 
             results.employeeContributions.disability + 
             results.employeeContributions.sickness + 
             results.employeeContributions.health,
      color: "url(#pensionGradient)",
      type: "negative"
    },
    {
      name: "Podatek dochodowy",
      value: results.employeeContributions.tax,
      color: "url(#taxGradient)",
      type: "negative"
    }
  ];

  const standardData: ChartItem[] = [
    {
      name: "Twoja wypłata (kwota netto)",
      value: results.netAmount,
      color: "url(#netAmountGradient)",
      type: "positive"
    },
    {
      name: "Ubezpieczenie emerytalne",
      value: results.employeeContributions.pension,
      color: "url(#pensionGradient)",
      type: "negative"
    },
    {
      name: "Ubezpieczenie rentowe",
      value: results.employeeContributions.disability,
      color: "url(#disabilityGradient)",
      type: "negative"
    },
    {
      name: "Ubezpieczenie chorobowe",
      value: results.employeeContributions.sickness,
      color: "url(#sicknessGradient)",
      type: "negative"
    },
    {
      name: "Składka zdrowotna",
      value: results.employeeContributions.health,
      color: "url(#healthGradient)",
      type: "negative"
    },
    {
      name: "Zaliczka na podatek",
      value: results.employeeContributions.tax,
      color: "url(#taxGradient)",
      type: "negative"
    }
  ];

  const employerCosts: ChartItem[] = [
    {
      name: "Wynagrodzenie brutto",
      value: results.grossAmount,
      color: "url(#netAmountGradient)",
      type: "positive"
    },
    {
      name: "Składka emerytalna (9,76%)",
      value: results.employerContributions.pension,
      color: "url(#pensionGradient)",
      type: "negative"
    },
    {
      name: "Składka rentowa (6,5%)",
      value: results.employerContributions.disability,
      color: "url(#disabilityGradient)",
      type: "negative"
    },
    {
      name: "Składka wypadkowa",
      value: results.employerContributions.accident,
      color: "url(#sicknessGradient)",
      type: "negative"
    },
    {
      name: "Fundusz Pracy (2,45%)",
      value: results.employerContributions.fp,
      color: "url(#healthGradient)",
      type: "negative"
    },
    {
      name: "FGŚP (0,1%)",
      value: results.employerContributions.fgsp,
      color: "url(#taxGradient)",
      type: "negative"
    },
    {
        name: "Łączny koszt pracodawcy",
        value: results.totalEmployerCost,
        color: "#4CAF50",
        type: "result"
    }
  ];

  const yearlyData = (): ChartItem[] => {
    const yearlyGross = results.grossAmount * 12;
    const totalContributions = 
      results.employeeContributions.pension +
      results.employeeContributions.disability +
      results.employeeContributions.sickness +
      results.employeeContributions.health;
    const yearlyContributions = totalContributions * 12;
    const yearlyTax = results.employeeContributions.tax * 12;
    const yearlyNet = results.netAmount * 12;

    const baseData = [
      {
        name: isB2B ? "Roczny przychód brutto" : "Roczne wynagrodzenie brutto",
        value: yearlyGross,
        color: "url(#netAmountGradient)",
        type: "positive"
      },
      {
        name: `Roczne składki ZUS (${((yearlyContributions / yearlyGross) * 100).toFixed(1)}% brutto)`,
        value: yearlyContributions,
        color: "url(#pensionGradient)",
        type: "negative"
      },
      {
        name: `Roczny podatek (${((yearlyTax / yearlyGross) * 100).toFixed(1)}% brutto)`,
        value: yearlyTax,
        color: "url(#taxGradient)",
        type: "negative"
      },
      {
        name: isB2B ? `Roczny zysk netto (${((yearlyNet / yearlyGross) * 100).toFixed(1)}% brutto)` : `Roczny dochód netto (${((yearlyNet / yearlyGross) * 100).toFixed(1)}% brutto)`,
        value: yearlyNet,
        color: "url(#netAmountGradient)",
        type: "result"
      }
    ];

    return baseData;
  };

  const getValueClassName = (type: string) => {
    switch (type) {
      case "positive":
        return "text-[#0099ff]";
      case "negative":
        return "text-red-600";
      case "result":
        return "text-[#0099ff] font-bold";
      default:
        return "";
    }
  };

  const getActiveData = (): ChartItem[] => {
    switch (activeTab) {
      case "monthly":
        return isB2B ? b2bMonthlyData : standardData;
      case "employer":
        return isB2B ? b2bData : employerCosts;
      case "yearly":
        return yearlyData();
      default:
        return isB2B ? b2bData : standardData;
    }
  };

  // Helper function to determine the color string for legend items
  const getLegendItemColorPair = (item: ChartItem, isB2BItem: boolean, activeTabString: string): string => {
    if (isB2BItem && activeTabString === "monthly") {
      if (item.name === "Kwota brutto") return "#0099ff, #0066ff";
      if (item.name === "Podatek VAT") return "#ec4899, #db2777"; // Pink
      if (item.name === "Składki ZUS") return "#9333ea, #6b21a8"; // Purple
      if (item.name === "Koszt uzyskania przychodu") return "#fb923c, #ea580c"; // Orange
      if (item.name === "Składka zdrowotna") return "#10b981, #047857"; // Green
      if (item.name === "Podatek PIT") return "#f87171, #dc2626"; // Red
      if (item.name === "Zysk na czysto") return "#0099ff, #0066ff";
      return "#0099ff, #0066ff"; // Default for B2B monthly
    } else {
      // Standard colors
      if (item.type === "positive" || item.type === "result") return "#0099ff, #0066ff";
      const lowerName = item.name.toLowerCase();
      if (lowerName.includes("emerytalna") || lowerName.includes("emerytalne")) return "#9333ea, #6b21a8"; // Purple
      if (lowerName.includes("rentow")) return "#fbbf24, #d97706"; // Yellow
      if (lowerName.includes("wypadkow")) return "#06b6d4, #0891b2"; // Cyan
      if (lowerName.includes("chorobow")) return "#06b6d4, #0891b2"; // Cyan (Sickness)
      if (lowerName.includes("zdrowotn")) return "#10b981, #047857"; // Green
      if (lowerName.includes("fundusz pracy") || lowerName.includes("fp")) return "#6366f1, #4f46e5"; // Indigo for FP
      if (lowerName.includes("fgśp")) return "#f87171, #dc2626"; // Red for FGSP
      if (lowerName.includes("koszt")) return "#fb923c, #ea580c"; // Orange (if "koszt" appears in non-B2B monthly)
      if (lowerName.includes("vat")) return "#ec4899, #db2777"; // Pink (if "VAT" appears in non-B2B monthly)
      if (lowerName.includes("podatek") || lowerName.includes("zaliczka")) return "#f87171, #dc2626"; // Red
      // General ZUS if not specifically matched, for non-B2B monthly view (e.g. "Składki ZUS" in yearly view)
      if (lowerName.includes("zus")) return "#9333ea, #6b21a8"; // Purple
      return "#0099ff, #0066ff"; // Default for standard
    }
  };

  const renderLegend = () => {
    const items = getActiveData();

    return (
      <div className="space-y-2 mr-15">
        {items.map((item, index) => {
          // Sprawdź czy to ostatni element "Zysk na czysto" dla B2B
          const isLastProfitItem = isB2B && activeTab === "monthly" && item.type === "result" && item.name === "Zysk na czysto";
          
          // Formatowanie wartości z uwzględnieniem typu (dodatnia/ujemna)
          const formattedValue = `${item.type === "negative" ? "-" : (item.type === "positive" || item.type === "result" ? "+" : "")}${formatCurrency(item.value)}`;

          return (
            <div key={index}>
              {/* Separator przed "Zysk na czysto" */}
              {isLastProfitItem && (
                <div className="border-t border-gray-300 my-2"></div>
              )}
              
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ 
                    background: `linear-gradient(to right, ${getLegendItemColorPair(item, isB2B, activeTab)})`
                  }}
                />
                <span className="text-sm text-gray-600 flex-grow pr-2">{item.name}</span>
                <span className={`font-medium whitespace-nowrap ${getValueClassName(item.type)}`}>
                  {/* Wyświetlanie sformatowanej wartości */}
                  {formattedValue}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Dodatkowe informacje dla B2B - szczegóły składek ZUS */}
        {isB2B && activeTab === "monthly" && (
          <>
            {/* Usunięto sekcję ze szczegółami składek ZUS, bo są już zsumowane wyżej */}
          </>
        )}
      </div>
    );
  };

  const chartData = getActiveData();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-2 items-start">
        <div className="relative flex justify-center">
          <div className="w-[300px] h-[300px] relative">
            <PieChartRechart width={300} height={300} key={`${activeTab}-${String(isB2B)}`}>
              <svg>
                <defs>
                  <linearGradient id="netAmountGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0099ff" />
                    <stop offset="100%" stopColor="#0066ff" />
                  </linearGradient>
                  <linearGradient id="pensionGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#6b21a8" />
                  </linearGradient>
                  <linearGradient id="disabilityGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                  <linearGradient id="sicknessGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="taxGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="vatGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                  <linearGradient id="fpGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="costsGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}-${activeTab}-${String(isB2B)}`} 
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChartRechart>
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="text-center"
                style={{
                  animation: 'fadeIn 0.5s ease-in-out'
                }}
              >
                <div className="text-2xl font-bold text-[#0099ff]">
                  {formatCurrency(results.grossAmount)}
                </div>
                <div className="text-xs text-gray-600">{isB2B ? "przychód" : "brutto"}</div>
                <div className="text-lg font-semibold text-[#0099ff]">
                  {formatCurrency(results.netAmount)} {isB2B ? "zysk" : "netto"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:pl-10 pr-10 mt-4">
          <div 
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            {renderLegend()}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}; 