
import React from "react";
import { Utensils, Clock, Shuffle, ChefHat, Edit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Meal, MealFood } from "@/services/mealPlanGenerator";

interface MealPlanAccordionProps {
  meals: Meal[];
  isRegeneratingMeal: string | null;
  regenerateMeal: (mealId: string) => void;
  openSubstitutionModal: (mealType: string, foodIndex: number) => void;
  formatQuantity: (quantity: number) => string;
}

const MealPlanAccordion: React.FC<MealPlanAccordionProps> = ({
  meals,
  isRegeneratingMeal,
  regenerateMeal,
  openSubstitutionModal,
  formatQuantity,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-nutri-green-500" />
          Seu Plano de Refeições - Base TBCA-USP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          defaultValue={meals.map(m => m.type)}
          className="space-y-4"
        >
          {meals.map((meal) => (
            <AccordionItem key={meal.id} value={meal.type} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-nutri-green-500 rounded-full">
                      <Utensils className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {meal.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-4">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(meal.totalCalories)} kcal
                    </Badge>
                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        regenerateMeal(meal.type);
                      }}
                      disabled={isRegeneratingMeal === meal.type}
                      variant="outline"
                      size="sm"
                    >
                      <Shuffle className={`w-3 h-3 ${isRegeneratingMeal === meal.type ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {meal.foods && meal.foods.length > 0 ? (
                    meal.foods.map((mealFood, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-nutri-green-100 rounded-lg flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-nutri-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{mealFood.food.name}</h4>
                            <p className="text-xs text-gray-600">
                              {formatQuantity(mealFood.quantity)} • {Math.round(mealFood.calories)} kcal • TBCA-USP
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">
                              P: {Math.round(mealFood.protein * 10) / 10}g
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              C: {Math.round(mealFood.carbs * 10) / 10}g
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              G: {Math.round(mealFood.fat * 10) / 10}g
                            </Badge>
                          </div>
                          <Button
                            onClick={() => openSubstitutionModal(meal.type, index)}
                            variant="outline"
                            size="sm"
                            title="Trocar alimento"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <ChefHat className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum alimento encontrado para esta refeição</p>
                      <Button
                        onClick={() => regenerateMeal(meal.type)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  )}
                  {/* Resumo da Refeição */}
                  <div className="grid grid-cols-4 gap-4 pt-3 border-t text-sm">
                    <div className="text-center">
                      <span className="text-gray-600">Total:</span>
                      <div className="font-semibold">{Math.round(meal.totalCalories)} kcal</div>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-600">Proteínas:</span>
                      <div className="font-semibold text-blue-600">{Math.round(meal.totalProtein * 10) / 10}g</div>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-600">Carboidratos:</span>
                      <div className="font-semibold text-orange-600">{Math.round(meal.totalCarbs * 10) / 10}g</div>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-600">Gorduras:</span>
                      <div className="font-semibold text-purple-600">{Math.round(meal.totalFat * 10) / 10}g</div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MealPlanAccordion;
