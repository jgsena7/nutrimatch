
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, TrendingDown, Check } from 'lucide-react';

interface NutritionSummaryProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat
}) => {
  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90 && percentage <= 110) return 'bg-green-500';
    if (percentage >= 80 && percentage <= 120) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90 && percentage <= 110) return <Check className="w-4 h-4 text-green-500" />;
    if (percentage > 110) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <TrendingDown className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusBadge = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90 && percentage <= 110) return <Badge className="bg-green-500">Ideal</Badge>;
    if (percentage > 110) return <Badge className="bg-red-500">Acima</Badge>;
    return <Badge className="bg-yellow-500">Abaixo</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-nutri-green-500" />
          Resumo Nutricional Diário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Calorias */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-nutri-dark-800">Calorias</h3>
              {getStatusIcon(totalCalories, targetCalories)}
            </div>
            <div className="text-2xl font-bold text-nutri-dark-900">
              {Math.round(totalCalories)} / {Math.round(targetCalories)}
            </div>
            <Progress 
              value={calculateProgress(totalCalories, targetCalories)} 
              className="h-2"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {Math.round(((totalCalories / targetCalories) * 100))}% da meta
              </span>
              {getStatusBadge(totalCalories, targetCalories)}
            </div>
          </div>

          {/* Proteínas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-nutri-dark-800">Proteínas</h3>
              {getStatusIcon(totalProtein, targetProtein)}
            </div>
            <div className="text-2xl font-bold text-nutri-dark-900">
              {Math.round(totalProtein)}g / {Math.round(targetProtein)}g
            </div>
            <Progress 
              value={calculateProgress(totalProtein, targetProtein)} 
              className="h-2"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {Math.round(((totalProtein / targetProtein) * 100))}% da meta
              </span>
              {getStatusBadge(totalProtein, targetProtein)}
            </div>
          </div>

          {/* Carboidratos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-nutri-dark-800">Carboidratos</h3>
              {getStatusIcon(totalCarbs, targetCarbs)}
            </div>
            <div className="text-2xl font-bold text-nutri-dark-900">
              {Math.round(totalCarbs)}g / {Math.round(targetCarbs)}g
            </div>
            <Progress 
              value={calculateProgress(totalCarbs, targetCarbs)} 
              className="h-2"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {Math.round(((totalCarbs / targetCarbs) * 100))}% da meta
              </span>
              {getStatusBadge(totalCarbs, targetCarbs)}
            </div>
          </div>

          {/* Gorduras */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-nutri-dark-800">Gorduras</h3>
              {getStatusIcon(totalFat, targetFat)}
            </div>
            <div className="text-2xl font-bold text-nutri-dark-900">
              {Math.round(totalFat)}g / {Math.round(targetFat)}g
            </div>
            <Progress 
              value={calculateProgress(totalFat, targetFat)} 
              className="h-2"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {Math.round(((totalFat / targetFat) * 100))}% da meta
              </span>
              {getStatusBadge(totalFat, targetFat)}
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 p-4 bg-nutri-green-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-nutri-dark-900">
                {Math.round(targetCalories - totalCalories)}
              </div>
              <div className="text-sm text-nutri-dark-600">
                {totalCalories < targetCalories ? 'Restantes' : 'Excesso'} (kcal)
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-nutri-dark-900">
                {Math.round((totalProtein / totalCalories) * 100)}%
              </div>
              <div className="text-sm text-nutri-dark-600">Proteína (% cal)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-nutri-dark-900">
                {Math.round((totalCarbs / totalCalories) * 100)}%
              </div>
              <div className="text-sm text-nutri-dark-600">Carboidrato (% cal)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-nutri-dark-900">
                {Math.round((totalFat / totalCalories) * 100)}%
              </div>
              <div className="text-sm text-nutri-dark-600">Gordura (% cal)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
