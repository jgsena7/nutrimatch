
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

interface MealPlanSummaryProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

const MealPlanSummary: React.FC<MealPlanSummaryProps> = ({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-nutri-green-500" />
          Resumo do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-nutri-green-50 rounded-lg">
            <div className="text-2xl font-bold text-nutri-green-600">
              {Math.round(totalCalories)}
            </div>
            <div className="text-sm text-gray-600">Total de Calorias</div>
            <div className="text-xs text-gray-500">Meta: {Math.round(targetCalories)}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(totalProtein)}g
            </div>
            <div className="text-sm text-gray-600">Total de Proteínas</div>
            <div className="text-xs text-gray-500">Meta: {Math.round(targetProtein)}g</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(totalCarbs)}g
            </div>
            <div className="text-sm text-gray-600">Total de Carboidratos</div>
            <div className="text-xs text-gray-500">Meta: {Math.round(targetCarbs)}g</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(totalFat)}g
            </div>
            <div className="text-sm text-gray-600">Total de Gorduras</div>
            <div className="text-xs text-gray-500">Meta: {Math.round(targetFat)}g</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanSummary;
