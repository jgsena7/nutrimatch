
import React, { useState } from 'react';
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calcular calorias de cada macronutriente
  const proteinCalories = totalProtein * 4;
  const carbsCalories = totalCarbs * 4;
  const fatCalories = totalFat * 9;

  const data = [
    {
      name: 'Proteínas',
      value: proteinCalories,
      grams: totalProtein,
      color: '#3B82F6',
      gradient: 'url(#proteinGradient)',
      percentage: Math.round((proteinCalories / totalCalories) * 100)
    },
    {
      name: 'Carboidratos',
      value: carbsCalories,
      grams: totalCarbs,
      color: '#F59E0B',
      gradient: 'url(#carbsGradient)',
      percentage: Math.round((carbsCalories / totalCalories) * 100)
    },
    {
      name: 'Gorduras',
      value: fatCalories,
      grams: totalFat,
      color: '#8B5CF6',
      gradient: 'url(#fatGradient)',
      percentage: Math.round((fatCalories / totalCalories) * 100)
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm bg-white/95 transform transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-gray-800" style={{ color: data.color }}>
              {data.name}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              {Math.round(data.value)} kcal
            </p>
            <p className="text-sm text-gray-600">
              {Math.round(data.grams)}g ({data.percentage}%)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: data.color,
                  width: `${data.percentage}%`
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-6 mt-6">
        {payload.map((entry: any, index: number) => (
          <div 
            key={index} 
            className={`flex items-center gap-3 cursor-pointer transition-all duration-200 p-2 rounded-lg hover:bg-gray-50 ${
              activeIndex === index ? 'bg-gray-100 scale-105' : ''
            }`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div 
              className="w-4 h-4 rounded-full shadow-sm transition-all duration-200" 
              style={{ 
                backgroundColor: entry.color,
                transform: activeIndex === index ? 'scale(1.2)' : 'scale(1)'
              }}
            />
            <div className="text-center">
              <span className="text-sm font-semibold text-gray-800 block">
                {entry.value}
              </span>
              <span className="text-xs text-gray-600">
                {Math.round(data[index].grams)}g
              </span>
              <span className="text-xs text-gray-500 block">
                {data[index].percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="text-center bg-gradient-to-r from-nutri-green-50 to-blue-50">
        <CardTitle className="text-xl text-nutri-dark-900 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-nutri-green-500 rounded-full animate-pulse" />
          Distribuição de Macronutrientes
        </CardTitle>
        <div className="flex items-center justify-center gap-4 mt-2">
          <p className="text-2xl font-bold text-nutri-dark-900">
            {Math.round(totalCalories)} 
          </p>
          <span className="text-sm text-gray-600">kcal totais</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="carbsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="fatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.gradient}
                    stroke={activeIndex === index ? entry.color : 'transparent'}
                    strokeWidth={activeIndex === index ? 3 : 0}
                    style={{
                      filter: activeIndex === index ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centro do gráfico com informação ativa */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-sm">
              {activeIndex !== null ? (
                <div className="transition-all duration-200">
                  <p className="text-lg font-bold" style={{ color: data[activeIndex].color }}>
                    {data[activeIndex].percentage}%
                  </p>
                  <p className="text-xs text-gray-600">
                    {data[activeIndex].name}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-lg font-bold text-nutri-dark-900">
                    {Math.round(totalCalories)}
                  </p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Legend content={<CustomLegend />} />
        
        {/* Barra de progresso visual */}
        <div className="mt-6 space-y-3">
          {data.map((item, index) => (
            <div 
              key={index}
              className={`transition-all duration-200 ${
                activeIndex === index || activeIndex === null ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium" style={{ color: item.color }}>
                  {item.name}
                </span>
                <span className="text-sm text-gray-600">
                  {item.grams}g ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${item.percentage}%`,
                    transform: activeIndex === index ? 'scaleY(1.2)' : 'scaleY(1)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
