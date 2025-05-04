"use client"

import React from "react";
import { Bar, BarChart as RechartBarChart, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartProps {
  data: Array<any>;
  dataKey: string;
  layout?: "horizontal" | "vertical";
  barSize?: number;
  nameKey?: string;
  tooltipFormatter?: (value: any, name: string, props: any) => any;
  children?: React.ReactNode;
}

export function BarChart({
  data,
  dataKey,
  layout = "vertical",
  barSize = 18,
  nameKey = "name",
  tooltipFormatter,
  children,
}: BarChartProps) {
  // Niestandardowy komponent Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const displayValue = tooltipFormatter 
        ? tooltipFormatter(payload[0].value, payload[0].name, payload[0]) 
        : payload[0].value;
      
      return (
        <div className="bg-white dark:bg-zinc-900 p-2 border border-gray-200 dark:border-gray-800 rounded shadow-md text-sm">
          <p className="font-medium">{label || payload[0].name}: {displayValue}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartBarChart
        data={data}
        margin={{ top: 15, right: 15, left: 5, bottom: 15 }}
        layout={layout}
        barSize={barSize}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={layout === "vertical" ? false : true} />
        
        {layout === "vertical" ? (
          <>
            <XAxis 
              type="number" 
              axisLine={false} 
              tickLine={false}
              tickCount={5}
              tickFormatter={(value) => value.toString()}
            />
            <YAxis 
              type="category" 
              dataKey={nameKey} 
              width={75} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
          </>
        ) : (
          <>
            <XAxis 
              type="category" 
              dataKey={nameKey} 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tickCount={5}
              tickFormatter={(value) => value.toString()}
            />
          </>
        )}
        
        <Tooltip content={<CustomTooltip />} />
        
        {children || (
          <Bar 
            dataKey={dataKey} 
            name="Wartość" 
            radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            fill="#4ade80"
          />
        )}
      </RechartBarChart>
    </ResponsiveContainer>
  );
} 