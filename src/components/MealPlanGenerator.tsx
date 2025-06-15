import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Target, Utensils, ThumbsUp, ThumbsDown, RefreshCw, ChefHat, Shuffle } from 'lucide-react';
import { foodDataService, FoodItem } from '@/services/foodDataService';
import { NutritionalCalculator, UserProfile, NutritionalNeeds } from '@/services/nutritionalCalculator';
import { mealPlanCache } from '@/services/mealPlanCache';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

interface MealFood {
  food: FoodItem;
  quantity: number;
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
  const { user } = useAuth();
  const [nutritionalNeeds, setNutritionalNeeds] = useState<NutritionalNeeds | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingMeal, setIsRegeneratingMeal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile && user) {
      const needs = NutritionalCalculator.calculateNutritionalNeeds(userProfile);
      setNutritionalNeeds(needs);
      loadMealPlan(needs);
    }
  }, [userProfile, user]);

  const loadMealPlan = async (needs: NutritionalNeeds) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Tentar carregar do cache primeiro
      const cachedPlan = mealPlanCache.getMealPlan(user.id, userProfile);
      
      if (cachedPlan && cachedPlan.meals && cachedPlan.meals.length > 0) {
        console.log('Carregando plano do cache...');
        setMeals(cachedPlan.meals);
        setIsLoading(false);
        
        toast({
          title: "Plano carregado!",
          description: "Seu plano alimentar foi carregado do cache.",
        });
        return;
      }
      
      // Se não há cache, gerar novo plano
      await generateMealPlan(needs, true);
      
    } catch (error) {
      console.error('Erro ao carregar plano:', error);
      await generateMealPlan(needs, true);
    }
  };

  const generateMealPlan = async (needs: NutritionalNeeds, isInitialLoad: boolean = false) => {
    if (!isInitialLoad) {
      setIsGenerating(true);
    }
    
    try {
      const mealCalories = NutritionalCalculator.distributeMealCalories(needs.calories);
      const mealSchedule = NutritionalCalculator.getMealSchedule();
      const mealNames = NutritionalCalculator.getMealNames();
      
      const generatedMeals: Meal[] = [];

      // Gerar todas as refeições com melhor distribuição de macros
      const mealPromises = Object.entries(mealCalories).map(async ([mealId, targetCalories]) => {
        const meal = await generateSingleMeal(mealId, mealNames[mealId], mealSchedule[mealId], targetCalories, needs);
        return meal;
      });

      const allMeals = await Promise.all(mealPromises);
      
      // Ordenar as refeições na ordem correta
      const mealOrder = ['cafe-da-manha', 'lanche-manha', 'almoco', 'lanche-tarde', 'jantar', 'ceia'];
      const orderedMeals = mealOrder.map(mealId => 
        allMeals.find(meal => meal.id === mealId)
      ).filter(Boolean) as Meal[];

      setMeals(orderedMeals);
      
      // Salvar no cache se há usuário
      if (user) {
        mealPlanCache.saveMealPlan(user.id, userProfile, { meals: orderedMeals });
      }
      
      // Calcular totais para verificar aderência às metas
      const totalCalories = orderedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
      const totalProtein = orderedMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
      
      toast({
        title: "Plano gerado com sucesso!",
        description: `Plano criado com ${Math.round(totalCalories)} kcal e ${Math.round(totalProtein)}g de proteína`,
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

  const generateSingleMeal = async (
    mealId: string,
    name: string,
    time: string,
    targetCalories: number,
    needs: NutritionalNeeds
  ): Promise<Meal> => {
    const meal: Meal = {
      id: mealId,
      name,
      time,
      targetCalories,
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    };

    // Gerar alimentos para esta refeição com múltiplas tentativas para garantir que não fique vazia
    let attempts = 0;
    const maxAttempts = 3;

    while (meal.foods.length === 0 && attempts < maxAttempts) {
      attempts++;
      console.log(`Tentativa ${attempts} para gerar ${mealId}`);
      
      try {
        const mealFoods = await generateOptimizedMealFoods(mealId, targetCalories, needs, userProfile);
        meal.foods = mealFoods;
      } catch (error) {
        console.error(`Erro na tentativa ${attempts} para ${mealId}:`, error);
        if (attempts === maxAttempts) {
          // Fallback: criar uma refeição básica
          meal.foods = await createFallbackMeal(mealId, targetCalories);
        }
      }
    }
    
    // Calcular totais
    meal.totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
    meal.totalProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
    meal.totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
    meal.totalFat = meal.foods.reduce((sum, food) => sum + food.fat, 0);

    return meal;
  };

  const createFallbackMeal = async (mealId: string, targetCalories: number): Promise<MealFood[]> => {
    const fallbackFoods = {
      'cafe-da-manha': ['pão', 'banana', 'leite'],
      'lanche-manha': ['maçã', 'iogurte'],
      'almoco': ['arroz', 'feijão', 'frango'],
      'lanche-tarde': ['pão integral', 'queijo'],
      'jantar': ['batata', 'carne', 'salada'],
      'ceia': ['chá', 'biscoito']
    };

    const foodQueries = fallbackFoods[mealId as keyof typeof fallbackFoods] || ['arroz', 'feijão'];
    const mealFoods: MealFood[] = [];

    for (const query of foodQueries) {
      try {
        const searchResults = await foodDataService.searchFoods(query, 3);
        if (searchResults.length > 0) {
          const food = searchResults[0];
          const quantity = Math.min(100, Math.max(30, (targetCalories / foodQueries.length / food.calories) * 100));
          
          mealFoods.push({
            food,
            quantity: Math.round(quantity),
            calories: Math.round((quantity / 100) * food.calories),
            protein: Math.round((quantity / 100) * food.protein * 10) / 10,
            carbs: Math.round((quantity / 100) * food.carbs * 10) / 10,
            fat: Math.round((quantity / 100) * food.fat * 10) / 10
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar ${query}:`, error);
      }
    }

    return mealFoods;
  };

  const regenerateMeal = async (mealId: string) => {
    if (!nutritionalNeeds) return;
    
    setIsRegeneratingMeal(mealId);
    
    try {
      const mealToRegenerate = meals.find(m => m.id === mealId);
      if (!mealToRegenerate) return;
      
      const newMeal = await generateSingleMeal(
        mealId, 
        mealToRegenerate.name, 
        mealToRegenerate.time, 
        mealToRegenerate.targetCalories, 
        nutritionalNeeds
      );
      
      const updatedMeals = meals.map(meal => 
        meal.id === mealId ? newMeal : meal
      );
      
      setMeals(updatedMeals);
      
      // Atualizar cache
      if (user) {
        mealPlanCache.saveMealPlan(user.id, userProfile, { meals: updatedMeals });
      }
      
      toast({
        title: "Refeição regenerada!",
        description: `${newMeal.name} foi atualizada com novas opções.`,
      });
      
    } catch (error) {
      console.error('Erro ao regenerar refeição:', error);
      toast({
        title: "Erro ao regenerar",
        description: "Não foi possível regenerar a refeição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingMeal(null);
    }
  };

  const generateOptimizedMealFoods = async (
    mealId: string, 
    targetCalories: number, 
    needs: NutritionalNeeds,
    profile: UserProfile
  ): Promise<MealFood[]> => {
    const mealFoods: MealFood[] = [];
    
    // Calcular metas de macros para esta refeição
    const mealProteinTarget = (needs.protein * getMealProteinPercentage(mealId)) / 100;
    const mealCarbsTarget = (needs.carbs * getMealCarbsPercentage(mealId)) / 100;
    const mealFatTarget = (needs.fat * getMealFatPercentage(mealId)) / 100;
    
    const mealFoodTypes = getOptimizedMealFoodTypes(mealId);
    const restrictions = profile.food_restrictions?.toLowerCase().split(',').map(r => r.trim()) || [];
    
    let remainingCalories = targetCalories;
    let remainingProtein = mealProteinTarget;
    let remainingCarbs = mealCarbsTarget;
    let remainingFat = mealFatTarget;

    for (const foodType of mealFoodTypes) {
      if (remainingCalories <= 30) break;
      
      try {
        const searchResults = await foodDataService.searchFoods(foodType.query, 8);
        
        const filteredFoods = searchResults.filter(food => {
          const foodName = food.name.toLowerCase();
          return !restrictions.some(restriction => 
            restriction && foodName.includes(restriction)
          );
        });

        if (filteredFoods.length > 0) {
          // Selecionar alimento baseado no que mais precisamos
          const selectedFood = selectBestFood(filteredFoods, {
            needsProtein: remainingProtein > 0,
            needsCarbs: remainingCarbs > 0,
            needsFat: remainingFat > 0,
            targetCalories: Math.min(remainingCalories, foodType.maxCalories)
          });
          
          if (selectedFood) {
            const targetCaloriesForFood = Math.min(remainingCalories, foodType.maxCalories);
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
              remainingProtein -= actualProtein;
              remainingCarbs -= actualCarbs;
              remainingFat -= actualFat;
            }
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar ${foodType.query}:`, error);
      }
    }

    return mealFoods;
  };

  const selectBestFood = (foods: FoodItem[], needs: any): FoodItem | null => {
    if (foods.length === 0) return null;
    
    // Pontuar alimentos baseado no que mais precisamos
    const scoredFoods = foods.map(food => {
      let score = 0;
      
      // Priorizar proteína se necessário
      if (needs.needsProtein && food.protein > 15) score += 3;
      if (needs.needsCarbs && food.carbs > 20) score += 2;
      if (needs.needsFat && food.fat > 10) score += 2;
      
      // Penalizar alimentos muito calóricos
      if (food.calories > needs.targetCalories * 1.5) score -= 2;
      
      // Bonus para alimentos balanceados
      if (food.protein > 5 && food.carbs > 5 && food.fat > 2) score += 1;
      
      return { food, score };
    });

    // Ordenar por pontuação e retornar o melhor
    scoredFoods.sort((a, b) => b.score - a.score);
    return scoredFoods[0].food;
  };

  const getMealProteinPercentage = (mealId: string): number => {
    const percentages: { [key: string]: number } = {
      'cafe-da-manha': 25,
      'lanche-manha': 10,
      'almoco': 35,
      'lanche-tarde': 10,
      'jantar': 20,
      'ceia': 0
    };
    return percentages[mealId] || 20;
  };

  const getMealCarbsPercentage = (mealId: string): number => {
    const percentages: { [key: string]: number } = {
      'cafe-da-manha': 25,
      'lanche-manha': 15,
      'almoco': 30,
      'lanche-tarde': 15,
      'jantar': 15,
      'ceia': 0
    };
    return percentages[mealId] || 20;
  };

  const getMealFatPercentage = (mealId: string): number => {
    const percentages: { [key: string]: number } = {
      'cafe-da-manha': 25,
      'lanche-manha': 10,
      'almoco': 35,
      'lanche-tarde': 10,
      'jantar': 20,
      'ceia': 0
    };
    return percentages[mealId] || 20;
  };

  const getOptimizedMealFoodTypes = (mealId: string) => {
    const foodTypes = {
      'cafe-da-manha': [
        { query: 'pão integral', maxCalories: 120 },
        { query: 'ovo', maxCalories: 80 },
        { query: 'banana', maxCalories: 90 },
        { query: 'leite desnatado', maxCalories: 80 },
        { query: 'aveia', maxCalories: 60 }
      ],
      'lanche-manha': [
        { query: 'fruta', maxCalories: 60 },
        { query: 'iogurte', maxCalories: 80 }
      ],
      'almoco': [
        { query: 'arroz integral', maxCalories: 180 },
        { query: 'feijão', maxCalories: 120 },
        { query: 'frango', maxCalories: 200 },
        { query: 'salada', maxCalories: 40 },
        { query: 'legumes', maxCalories: 60 }
      ],
      'lanche-tarde': [
        { query: 'fruta', maxCalories: 70 },
        { query: 'castanha', maxCalories: 80 }
      ],
      'jantar': [
        { query: 'peixe', maxCalories: 150 },
        { query: 'batata doce', maxCalories: 120 },
        { query: 'verduras', maxCalories: 50 },
        { query: 'azeite', maxCalories: 40 }
      ],
      'ceia': [
        { query: 'chá', maxCalories: 20 }
      ]
    };

    return foodTypes[mealId as keyof typeof foodTypes] || [];
  };

  const regeneratePlan = () => {
    if (nutritionalNeeds) {
      // Limpar cache antes de regenerar
      if (user) {
        mealPlanCache.clearUserCache(user.id);
      }
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
            <h3 className="text-lg font-semibold mb-2">Carregando seu plano personalizado...</h3>
            <p className="text-gray-600">Otimizando alimentos brasileiros da TBCA-USP para suas metas.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular totais
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);

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
                {isGenerating ? 'Gerando...' : 'Gerar Novo Plano'}
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
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-lg font-bold text-nutri-green-600">
                      {meal.totalCalories} kcal
                    </div>
                    <div className="text-sm text-gray-600">
                      Meta: {meal.targetCalories} kcal
                    </div>
                  </div>
                  <Button
                    onClick={() => regenerateMeal(meal.id)}
                    disabled={isRegeneratingMeal === meal.id}
                    variant="outline"
                    size="sm"
                  >
                    <Shuffle className={`w-4 h-4 ${isRegeneratingMeal === meal.id ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {meal.foods.length > 0 ? (
                  meal.foods.map((mealFood, index) => (
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
                            {formatQuantity(mealFood.quantity)} • {mealFood.calories} kcal • TBCA-USP
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum alimento encontrado para esta refeição</p>
                    <Button
                      onClick={() => regenerateMeal(meal.id)}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                )}
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
                  {Math.round(totalCalories)}
                </div>
                <div className="text-sm text-gray-600">Total de Calorias</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(totalProtein)}g
                </div>
                <div className="text-sm text-gray-600">Total de Proteínas</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(totalCarbs)}g
                </div>
                <div className="text-sm text-gray-600">Total de Carboidratos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(totalFat)}g
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
