
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Target, Utensils, ThumbsUp, ThumbsDown, RefreshCw, ChefHat } from 'lucide-react';
import { foodDataService, FoodItem } from '@/services/foodDataService';
import { NutritionalCalculator, UserProfile, NutritionalNeeds } from '@/services/nutritionalCalculator';
import { useToast } from "@/hooks/use-toast";

interface MealFood {
  food: FoodItem;
  quantity: number; // em gramas
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  targetCalories: number;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface MealPlanGeneratorProps {
  userProfile: UserProfile;
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ userProfile }) => {
  const [nutritionalNeeds, setNutritionalNeeds] = useState<NutritionalNeeds | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
      const needs = NutritionalCalculator.calculateNutritionalNeeds(userProfile);
      setNutritionalNeeds(needs);
      generateMealPlan(needs);
    }
  }, [userProfile]);

  const generateMealPlan = async (needs: NutritionalNeeds) => {
    setIsGenerating(true);
    setIsLoading(true);
    
    try {
      const mealCalories = NutritionalCalculator.distributeMealCalories(needs.calories);
      const mealSchedule = NutritionalCalculator.getMealSchedule();
      const mealNames = NutritionalCalculator.getMealNames();
      
      const generatedMeals: Meal[] = [];

      for (const [mealId, targetCalories] of Object.entries(mealCalories)) {
        const meal: Meal = {
          id: mealId,
          name: mealNames[mealId],
          time: mealSchedule[mealId],
          targetCalories,
          foods: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        };

        // Gerar alimentos para esta refeição
        const mealFoods = await generateMealFoods(mealId, targetCalories, userProfile);
        meal.foods = mealFoods;
        
        // Calcular totais
        meal.totalCalories = mealFoods.reduce((sum, food) => sum + food.calories, 0);
        meal.totalProtein = mealFoods.reduce((sum, food) => sum + food.protein, 0);
        meal.totalCarbs = mealFoods.reduce((sum, food) => sum + food.carbs, 0);
        meal.totalFat = mealFoods.reduce((sum, food) => sum + food.fat, 0);

        generatedMeals.push(meal);
      }

      setMeals(generatedMeals);
      
      toast({
        title: "Plano gerado com sucesso!",
        description: `Criado plano personalizado com ${needs.calories} kcal/dia`,
      });

    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      toast({
        title: "Erro ao gerar plano",
        description: "Ocorreu um erro ao criar seu plano alimentar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const generateMealFoods = async (mealId: string, targetCalories: number, profile: UserProfile): Promise<MealFood[]> => {
    const mealFoods: MealFood[] = [];
    
    // Definir tipos de alimentos por refeição
    const mealFoodTypes = getMealFoodTypes(mealId);
    const restrictions = profile.food_restrictions?.toLowerCase().split(',').map(r => r.trim()) || [];
    
    let remainingCalories = targetCalories;

    for (const foodType of mealFoodTypes) {
      if (remainingCalories <= 50) break; // Parar se restarem poucas calorias
      
      try {
        // Buscar alimentos deste tipo
        const searchResults = await foodDataService.searchFoods(foodType.query, 10);
        
        // Filtrar alimentos com restrições
        const filteredFoods = searchResults.filter(food => {
          const foodName = food.name.toLowerCase();
          return !restrictions.some(restriction => 
            restriction && foodName.includes(restriction)
          );
        });

        if (filteredFoods.length > 0) {
          const selectedFood = filteredFoods[0]; // Selecionar o primeiro alimento válido
          const targetCaloriesForFood = Math.min(remainingCalories, foodType.maxCalories);
          
          // Calcular quantidade em gramas para atingir as calorias desejadas
          const quantity = Math.round((targetCaloriesForFood / selectedFood.calories) * 100);
          
          if (quantity > 0) {
            const actualCalories = Math.round((quantity / 100) * selectedFood.calories);
            const actualProtein = Math.round((quantity / 100) * selectedFood.protein * 10) / 10;
            const actualCarbs = Math.round((quantity / 100) * selectedFood.carbs * 10) / 10;
            const actualFat = Math.round((quantity / 100) * selectedFood.fat * 10) / 10;

            mealFoods.push({
              food: selectedFood,
              quantity,
              calories: actualCalories,
              protein: actualProtein,
              carbs: actualCarbs,
              fat: actualFat
            });

            remainingCalories -= actualCalories;
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar ${foodType.query}:`, error);
      }
    }

    return mealFoods;
  };

  const getMealFoodTypes = (mealId: string) => {
    const foodTypes = {
      'cafe-da-manha': [
        { query: 'pão integral', maxCalories: 150 },
        { query: 'ovo', maxCalories: 100 },
        { query: 'banana', maxCalories: 80 },
        { query: 'leite', maxCalories: 100 }
      ],
      'lanche-manha': [
        { query: 'fruta', maxCalories: 60 },
        { query: 'iogurte', maxCalories: 80 }
      ],
      'almoco': [
        { query: 'arroz integral', maxCalories: 150 },
        { query: 'feijão', maxCalories: 100 },
        { query: 'frango', maxCalories: 200 },
        { query: 'salada', maxCalories: 50 },
        { query: 'azeite', maxCalories: 50 }
      ],
      'lanche-tarde': [
        { query: 'castanha', maxCalories: 80 },
        { query: 'fruta', maxCalories: 60 }
      ],
      'jantar': [
        { query: 'peixe', maxCalories: 150 },
        { query: 'batata doce', maxCalories: 120 },
        { query: 'brócolis', maxCalories: 40 },
        { query: 'azeite', maxCalories: 40 }
      ],
      'ceia': [
        { query: 'iogurte natural', maxCalories: 80 }
      ]
    };

    return foodTypes[mealId as keyof typeof foodTypes] || [];
  };

  const regeneratePlan = () => {
    if (nutritionalNeeds) {
      generateMealPlan(nutritionalNeeds);
    }
  };

  const formatQuantity = (quantity: number): string => {
    if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}kg`;
    }
    return `${quantity}g`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-nutri-green-500" />
            <h3 className="text-lg font-semibold mb-2">Gerando seu plano personalizado...</h3>
            <p className="text-gray-600">Analisando suas necessidades nutricionais e selecionando os melhores alimentos.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Nutricional */}
      {nutritionalNeeds && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-nutri-green-500" />
                Suas Metas Nutricionais Diárias
              </CardTitle>
              <Button
                onClick={regeneratePlan}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Gerar Novo Plano
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-nutri-green-600">{nutritionalNeeds.calories}</div>
                <div className="text-sm text-gray-600">Calorias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{nutritionalNeeds.protein}g</div>
                <div className="text-sm text-gray-600">Proteínas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{nutritionalNeeds.carbs}g</div>
                <div className="text-sm text-gray-600">Carboidratos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{nutritionalNeeds.fat}g</div>
                <div className="text-sm text-gray-600">Gorduras</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{nutritionalNeeds.fiber}g</div>
                <div className="text-sm text-gray-600">Fibras</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plano de Refeições */}
      <div className="grid gap-6">
        {meals.map((meal) => (
          <Card key={meal.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-nutri-green-50 to-nutri-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nutri-green-500 rounded-full">
                    <Utensils className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {meal.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-nutri-green-600">
                    {meal.totalCalories} kcal
                  </div>
                  <div className="text-sm text-gray-600">
                    Meta: {meal.targetCalories} kcal
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {meal.foods.map((mealFood, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={mealFood.food.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=48&h=48&fit=crop&crop=center'}
                        alt={mealFood.food.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=48&h=48&fit=crop&crop=center';
                        }}
                      />
                      <div>
                        <h4 className="font-medium">{mealFood.food.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatQuantity(mealFood.quantity)} • {mealFood.calories} kcal
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        P: {mealFood.protein}g
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        C: {mealFood.carbs}g
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        G: {mealFood.fat}g
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-semibold">{meal.totalCalories} kcal</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Proteínas:</span>
                    <div className="font-semibold text-blue-600">{meal.totalProtein}g</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Carboidratos:</span>
                    <div className="font-semibold text-orange-600">{meal.totalCarbs}g</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Gorduras:</span>
                    <div className="font-semibold text-purple-600">{meal.totalFat}g</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <ChefHat className="w-4 h-4" />
                    Receitas
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo do Dia */}
      {meals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-nutri-green-500" />
              Resumo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-nutri-green-50 rounded-lg">
                <div className="text-2xl font-bold text-nutri-green-600">
                  {meals.reduce((sum, meal) => sum + meal.totalCalories, 0)}
                </div>
                <div className="text-sm text-gray-600">Total de Calorias</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(meals.reduce((sum, meal) => sum + meal.totalProtein, 0))}g
                </div>
                <div className="text-sm text-gray-600">Total de Proteínas</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(meals.reduce((sum, meal) => sum + meal.totalCarbs, 0))}g
                </div>
                <div className="text-sm text-gray-600">Total de Carboidratos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(meals.reduce((sum, meal) => sum + meal.totalFat, 0))}g
                </div>
                <div className="text-sm text-gray-600">Total de Gorduras</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanGenerator;
