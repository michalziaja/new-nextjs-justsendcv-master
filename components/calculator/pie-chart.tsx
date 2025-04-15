"use client";

import { PieChart as PieChartRechart, Pie, Cell } from "recharts";
import { CalculationResults } from "./utils/types";
import { formatCurrency } from "./utils/formatters";

interface PieChartProps {
  results: CalculationResults;
  activeTab?: "components" | "employer" | "yearly";
}

interface ChartItem {
  name: string;
  value: number;
  color: string;
  type: string;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  results, 
  activeTab = "components" 
}) => {
  const gradients = {
    netAmount: ["from-[#00B2FF]", "to-blue-600"],
    pension: ["from-purple-500", "to-purple-700"],
    disability: ["from-yellow-500", "to-yellow-700"],
    sickness: ["from-cyan-500", "to-cyan-700"],
    health: ["from-green-500", "to-green-700"],
    tax: ["from-red-500", "to-red-700"]
  };

  const data: ChartItem[] = [
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

    return [
      {
        name: "Roczne wynagrodzenie brutto",
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
        name: `Roczny dochód netto (${((yearlyNet / yearlyGross) * 100).toFixed(1)}% brutto)`,
        value: yearlyNet,
        color: "url(#netAmountGradient)",
        type: "result"
      }
    ];
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
      case "employer":
        return employerCosts;
      case "yearly":
        return yearlyData();
      default:
        return data;
    }
  };

  const renderLegend = () => {
    const items = getActiveData();

    return (
      <div className="space-y-2 mr-15">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ 
                background: `linear-gradient(to right, ${
                  item.type === "positive" || item.type === "result" ? "#0099ff, #0066ff" :
                  item.name.toLowerCase().includes("emerytalna") ? "#9333ea, #6b21a8" :
                  item.name.toLowerCase().includes("rentow") ? "#fb923c, #ea580c" :
                  item.name.toLowerCase().includes("chorobow") || item.name.toLowerCase().includes("wypadkow") ? "#fbbf24, #d97706" :
                  item.name.toLowerCase().includes("zdrowotn") || item.name.toLowerCase().includes("pracy") ? "#34d399, #059669" :
                  item.name.toLowerCase().includes("podatek") || item.name.toLowerCase().includes("fgśp") ? "#f87171, #dc2626" :
                  "#0099ff, #0066ff"
                })`
              }}
            />
            <span className="text-sm text-gray-600 flex-grow pr-2">{item.name}</span>
            <span className={`font-medium whitespace-nowrap ${getValueClassName(item.type)}`}>
              {item.type === "negative" ? "-" : ""}
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const chartData = getActiveData();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-2 items-start">
        <div className="relative flex justify-center">
          <div className="w-[300px] h-[300px] relative">
            <PieChartRechart width={300} height={300} key={activeTab}>
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
                    key={`cell-${index}-${activeTab}`} 
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
                <div className="text-xs text-gray-600">brutto</div>
                <div className="text-lg font-semibold text-[#0099ff]">
                  {formatCurrency(results.netAmount)} netto
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