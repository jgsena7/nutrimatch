
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from 'lucide-react';

interface NutritionSummaryProps {
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targetNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const NutritionSummary = ({ dailyTotals, targetNutrition }: NutritionSummaryProps) => {
  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getNutrientColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return 'bg-green-500';
    if (percentage >= 80 && percentage <= 120) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Resumo Nutricional Diário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Calories */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Calorias</span>
              <span className="text-sm text-gray-600">
                {dailyTotals.calories} / {targetNutrition.calories}
              </span>
            </div>
            <Progress 
              value={calculatePercentage(dailyTotals.calories, targetNutrition.calories)} 
              className="h-2"
            />
            <div className="text-xs text-gray-500">
              {Math.round(calculatePercentage(dailyTotals.calories, targetNutrition.calories))}% da meta
            </div>
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Proteínas</span>
              <span className="text-sm text-gray-600">
                {dailyTotals.protein}g / {targetNutrition.protein}g
              </span>
            </div>
            <Progress 
              value={calculatePercentage(dailyTotals.protein, targetNutrition.protein)} 
              className="h-2"
            />
            <div className="text-xs text-gray-500">
              {Math.round(calculatePercentage(dailyTotals.protein, targetNutrition.protein))}% da meta
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Carboidratos</span>
              <span className="text-sm text-gray-600">
                {dailyTotals.carbs}g / {targetNutrition.carbs}g
              </span>
            </div>
            <Progress 
              value={calculatePercentage(dailyTotals.carbs, targetNutrition.carbs)} 
              className="h-2"
            />
            <div className="text-xs text-gray-500">
              {Math.round(calculatePercentage(dailyTotals.carbs, targetNutrition.carbs))}% da meta
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Gorduras</span>
              <span className="text-sm text-gray-600">
                {dailyTotals.fat}g / {targetNutrition.fat}g
              </span>
            </div>
            <Progress 
              value={calculatePercentage(dailyTotals.fat, targetNutrition.fat)} 
              className="h-2"
            />
            <div className="text-xs text-gray-500">
              {Math.round(calculatePercentage(dailyTotals.fat, targetNutrition.fat))}% da meta
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-nutri-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-nutri-green-600" />
            <span className="font-medium text-nutri-green-800">Status do Plano</span>
          </div>
          <p className="text-sm text-nutri-green-700">
            Plano nutricional personalizado baseado em suas metas e preferências. 
            Os valores podem variar ligeiramente devido à disponibilidade de alimentos nas bases de dados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionSummary;
