
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
}

interface Meal {
  name: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface MealCardProps {
  meal: Meal;
}

const MealCard = ({ meal }: MealCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          {meal.name}
        </CardTitle>
        <div className="flex gap-2 text-sm text-gray-600">
          <span>{meal.totalCalories} kcal</span>
          <span>•</span>
          <span>{meal.totalProtein}g proteína</span>
          <span>•</span>
          <span>{meal.totalCarbs}g carboidratos</span>
          <span>•</span>
          <span>{meal.totalFat}g gordura</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {meal.foods.map((food, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{food.name}</h4>
                <div className="flex gap-2 mt-1">
                  <Badge variant={food.source === 'openfoodfacts' ? 'default' : 'secondary'} className="text-xs">
                    {food.source === 'openfoodfacts' ? 'OFF' : 'USDA'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {food.quantity}{food.unit}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{food.calories} kcal</div>
                <div className="text-gray-600">
                  P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                </div>
              </div>
            </div>
          ))}
          
          {meal.foods.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>Não foi possível encontrar alimentos adequados para esta refeição.</p>
              <p className="text-sm">Tente gerar um novo plano.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
