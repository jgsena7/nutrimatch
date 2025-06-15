
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface NutritionalPieChartProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export const NutritionalPieChart: React.FC<NutritionalPieChartProps> = ({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat
}) => {
  // Calcular calorias de cada macronutriente
  const proteinCalories = totalProtein * 4;
  const carbsCalories = totalCarbs * 4;
  const fatCalories = totalFat * 9;

  const data = [
    {
      name: 'Proteínas',
      value: proteinCalories,
      grams: totalProtein,
      color: '#3B82F6'
    },
    {
      name: 'Carboidratos',
      value: carbsCalories,
      grams: totalCarbs,
      color: '#F59E0B'
    },
    {
      name: 'Gorduras',
      value: fatCalories,
      grams: totalFat,
      color: '#8B5CF6'
    }
  ];

  const COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm">
            {Math.round(data.value)} kcal ({Math.round(data.grams)}g)
          </p>
          <p className="text-xs text-gray-500">
            {Math.round((data.value / totalCalories) * 100)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.value}</span>
            <span className="text-xs text-gray-600">
              {Math.round(data[index].grams)}g
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Distribuição de Macronutrientes</CardTitle>
        <p className="text-center text-gray-600 text-sm">
          Total: {Math.round(totalCalories)} kcal
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
