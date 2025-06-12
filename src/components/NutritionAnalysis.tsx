
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NutritionAnalysis = () => {
  const navigate = useNavigate();
  
  const nutritionData = [{
    name: 'Proteínas',
    value: 39.5,
    calories: 326,
    color: '#A4DA14'
  }, {
    name: 'Lipídios',
    value: 19.7,
    calories: 251.3,
    color: '#255F38'
  }, {
    name: 'Carboidratos',
    value: 40.8,
    calories: 400.7,
    color: '#18230F'
  }];

  const handleNavigateToProfile = () => {
    navigate('/nutritional-profile-consolidated');
  };

  return <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          <span className="text-nutri-green-400">Nutri</span><span className="text-white">Match</span> - Seu Plano Alimentar Personalizado
        </h1>
        <div className="w-32 h-1 bg-nutri-green-500 mx-auto rounded-full"></div>
      </div>

      <Card className="bg-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-black">
            Análise de nutrientes do cardápio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={nutritionData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                    {nutritionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {nutritionData.map((item, index) => <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded" style={{
                  backgroundColor: item.color
                }}></div>
                    <span className="font-medium text-nutri-dark-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-nutri-dark-900">{item.calories} Kcal - {item.value}%</div>
                  </div>
                </div>)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-200 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-nutri-green-100 rounded-full">
                <User className="w-8 h-8 text-nutri-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-nutri-dark-900">
              Visualizar Perfil Nutricional Completo
            </h3>
            <p className="text-nutri-dark-600 max-w-md mx-auto">
              Acesse seu perfil nutricional detalhado com todas as refeições, metas e informações personalizadas.
            </p>
            <Button 
              onClick={handleNavigateToProfile}
              className="bg-nutri-green-500 hover:bg-nutri-green-600 text-white px-8 py-3 rounded-full font-semibold text-lg"
            >
              Acessar Perfil Nutricional
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};

export default NutritionAnalysis;
