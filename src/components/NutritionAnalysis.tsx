
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const NutritionAnalysis = () => {
  const nutritionData = [
    { name: 'Proteínas', value: 39.5, calories: 326, color: '#22c55e' },
    { name: 'Lipídios', value: 19.7, calories: 251.3, color: '#3b82f6' },
    { name: 'Carboidratos', value: 40.8, calories: 400.7, color: '#1e40af' }
  ];

  const meals = [
    {
      time: "07:30 - Café da manhã",
      items: [
        "Ovo de galinha mexido - 2 unidades ou 90g",
        "Pão de forma integral - 2 fatias ou 50g",
        "Semente de chia - 1 colher de sopa cheia ou 15g"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="text-nutri-blue-200">Nutri</span>
          <span className="text-nutri-green-300">Match</span> - Seu Plano Alimentar Personalizado
        </h1>
        <div className="w-32 h-1 bg-nutri-green-400 mx-auto rounded-full"></div>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-nutri-blue-800">
            Análise de nutrientes do cardápio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {nutritionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium text-nutri-blue-800">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-nutri-blue-800">{item.calories} Kcal - {item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-nutri-blue-800">
            Refeições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Select defaultValue="cafe">
              <SelectTrigger className="bg-white rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cafe">07:30 - Café da manhã</SelectItem>
                <SelectItem value="almoco">12:30 - Almoço</SelectItem>
                <SelectItem value="lanche">15:00 - Lanche</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="almoco">
              <SelectTrigger className="bg-white rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cafe">07:30 - Café da manhã</SelectItem>
                <SelectItem value="almoco">12:30 - Almoço</SelectItem>
                <SelectItem value="lanche">15:00 - Lanche</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="lanche">
              <SelectTrigger className="bg-white rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cafe">07:30 - Café da manhã</SelectItem>
                <SelectItem value="almoco">12:30 - Almoço</SelectItem>
                <SelectItem value="lanche">15:00 - Lanche</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-nutri-blue-800 mb-4 flex items-center">
              {meals[0].time}
              <button className="ml-2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>
            <ul className="space-y-2">
              {meals[0].items.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionAnalysis;
