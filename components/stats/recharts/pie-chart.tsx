"use client"

import React from "react";
import { PieChart as RechartPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PieChartProps {
  data: Array<any>;
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  tooltipFormatter?: (value: any, name?: string, props?: any) => any;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  animationDuration?: number;
  startAngle?: number;
  endAngle?: number;
  showLegend?: boolean;
}

export function PieChart({
  data,
  dataKey,
  nameKey = "name",
  colors = ["#4ade80", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
  tooltipFormatter,
  innerRadius = 60,
  outerRadius = 80,
  paddingAngle = 2,
  animationDuration = 500,
  startAngle = 0,
  endAngle = 360,
  showLegend = false,
}: PieChartProps) {
  // Niestandardowy komponent Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const displayValue = tooltipFormatter 
        ? tooltipFormatter(payload[0].value, payload[0].name, payload[0]) 
        : payload[0].value;
      
      return (
        <div className="bg-white dark:bg-zinc-900 p-2 border border-gray-200 dark:border-gray-800 rounded shadow-md text-sm">
          <p className="font-medium">{payload[0].name}: {displayValue}</p>
        </div>
      );
    }
    return null;
  };

  // Niestandardowy renderujący etykiety wewnątrz wykresu
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    // Obliczenia położenia etykiety
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Wyświetlanie tylko jeśli procent jest większy niż 10%
    if (percent < 0.1) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="11"
        fontWeight="700"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Przygotowanie kolorów dla komórek wykresu
  const pieColors = data.map((item, index) => {
    if (item.color) {
      return item.color;
    }
    return colors[index % colors.length];
  });
  
  // Niestandardowa legenda kompaktowa
  const renderColorfulLegendText = (value: string, entry: any) => {
    return <span className="text-xs font-medium">{value}</span>;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="40%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          dataKey={dataKey}
          nameKey={nameKey}
          animationDuration={animationDuration}
          labelLine={false}
          label={renderCustomizedLabel}
          startAngle={startAngle}
          endAngle={endAngle}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={pieColors[index]} 
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            formatter={renderColorfulLegendText}
            iconSize={8}
            iconType="circle"
          />
        )}
      </RechartPieChart>
    </ResponsiveContainer>
  );
} 