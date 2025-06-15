
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Target, Utensils, RefreshCw, ChefHat, Shuffle, Edit } from 'lucide-react';
import { mealPlanGenerator, UserProfile, MealPlan, Meal, MealFood } from '@/services/mealPlanGenerator';
import { foodDataService } from '@/services/foodDataService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

interface MealPlanGeneratorProps {
  userProfile: {
    name: string;
    age: number;
    height: number;
    weight: number;
    gender: string;
    activity_level: string;
    goal: string;
    food_preferences: string;
    food_restrictions: string;
  };
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ userProfile }) => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingMeal, setIsRegeneratingMeal] = useState<string | null>(null);
  const [isSubstituting, setIsSubstituting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile && user) {
      generateMealPlan();
    }
  }, [userProfile, user]);

  const generateMealPlan = async () => {
    if (!userProfile.name) {
      toast({
        title: "Perfil incompleto",
        description: "Por favor, complete seu perfil nutricional antes de gerar um plano.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setIsLoading(true);
    
    try {
      const profile: UserProfile = {
        age: userProfile.age,
        height: userProfile.height,
        weight: userProfile.weight,
        gender: userProfile.gender as any,
        activityLevel: userProfile.activity_level as any,
        goal: userProfile.goal as any,
        foodPreferences: userProfile.food_preferences ? userProfile.food_preferences.split(',').map(p => p.trim()) : [],
        foodRestrictions: userProfile.food_restrictions ? userProfile.food_restrictions.split(',').map(r => r.trim()) : []
      };

      console.log('Gerando plano com perfil:', profile);
      const plan = await mealPlanGenerator.generateMealPlan(profile);
      console.log('Plano gerado:', plan);
      
      setMealPlan(plan);
      
      toast({
        title: "Plano gerado com sucesso!",
        description: `Plano criado com ${Math.round(plan.totalCalories)} kcal e ${Math.round(plan.totalProtein)}g de proteína`,
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

  const regenerateMeal = async (mealId: string) => {
    if (!mealPlan) return;
    
    setIsRegeneratingMeal(mealId);
    
    try {
      const profile: UserProfile = {
        age: userProfile.age,
        height: userProfile.height,
        weight: userProfile.weight,
        gender: userProfile.gender as any,
        activityLevel: userProfile.activity_level as any,
        goal: userProfile.goal as any,
        foodPreferences: userProfile.food_preferences ? userProfile.food_preferences.split(',').map(p => p.trim()) : [],
        foodRestrictions: userProfile.food_restrictions ? userProfile.food_restrictions.split(',').map(r => r.trim()) : []
      };

      // Gerar um novo plano completo e pegar apenas a refeição específica
      const newPlan = await mealPlanGenerator.generateMealPlan(profile);
      const newMeal = newPlan.meals.find(m => m.type === mealId);
      
      if (newMeal) {
        const updatedMeals = mealPlan.meals.map(meal => 
          meal.type === mealId ? newMeal : meal
        );
        
        // Recalcular totais
        const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        const totalProtein = updatedMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
        const totalCarbs = updatedMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
        const totalFat = updatedMeals.reduce((sum, meal) => sum + meal.totalFat, 0);

        setMealPlan({
          ...mealPlan,
          meals: updatedMeals,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat
        });
        
        toast({
          title: "Refeição regenerada!",
          description: `${newMeal.name} foi atualizada com novas opções.`,
        });
      }
      
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

  const substituteFoodItem = async (mealType: string, foodIndex: number) => {
    if (!mealPlan) return;
    
    const substitutionKey = `${mealType}-${foodIndex}`;
    setIsSubstituting(substitutionKey);
    
    try {
      const meal = mealPlan.meals.find(m => m.type === mealType);
      if (!meal || !meal.foods[foodIndex]) return;

      const originalFood = meal.foods[foodIndex];
      const restrictions = userProfile.food_restrictions ? userProfile.food_restrictions.split(',').map(r => r.trim()) : [];

      // Buscar substitutos similares
      const substitutes = await foodDataService.getFoodSubstitutes(originalFood.food, restrictions);
      
      if (substitutes.length > 0) {
        const newFood = substitutes[0];
        
        // Calcular nova quantidade para manter calorias similares
        const newQuantity = Math.round((originalFood.calories * 100) / newFood.calories);
        
        const newMealFood: MealFood = {
          food: newFood,
          quantity: Math.max(newQuantity, 10), // Mínimo 10g
          calories: Math.round((newQuantity / 100) * newFood.calories),
          protein: Math.round((newQuantity / 100) * newFood.protein * 10) / 10,
          carbs: Math.round((newQuantity / 100) * newFood.carbs * 10) / 10,
          fat: Math.round((newQuantity / 100) * newFood.fat * 10) / 10
        };

        // Atualizar a refeição
        const updatedMeals = mealPlan.meals.map(m => {
          if (m.type === mealType) {
            const updatedFoods = [...m.foods];
            updatedFoods[foodIndex] = newMealFood;
            
            // Recalcular totais da refeição
            const totalCalories = updatedFoods.reduce((sum, food) => sum + food.calories, 0);
            const totalProtein = updatedFoods.reduce((sum, food) => sum + food.protein, 0);
            const totalCarbs = updatedFoods.reduce((sum, food) => sum + food.carbs, 0);
            const totalFat = updatedFoods.reduce((sum, food) => sum + food.fat, 0);

            return {
              ...m,
              foods: updatedFoods,
              totalCalories,
              totalProtein,
              totalCarbs,
              totalFat
            };
          }
          return m;
        });

        // Recalcular totais do plano
        const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        const totalProtein = updatedMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
        const totalCarbs = updatedMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
        const totalFat = updatedMeals.reduce((sum, meal) => sum + meal.totalFat, 0);

        setMealPlan({
          ...mealPlan,
          meals: updatedMeals,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat
        });
        
        toast({
          title: "Alimento substituído",
          description: `${originalFood.food.name} foi substituído por ${newFood.name}`,
        });
      } else {
        toast({
          title: "Nenhum substituto encontrado",
          description: "Não foi possível encontrar um substituto adequado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar substituto:', error);
      toast({
        title: "Erro na substituição",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubstituting(null);
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
            <p className="text-gray-600">Criando plano alimentar com dados brasileiros da TBCA-USP.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-nutri-green-500" />
            <h3 className="text-2xl font-semibold mb-4">Gerar Plano Alimentar Personalizado</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Crie um plano alimentar inteligente baseado no seu perfil nutricional, 
              preferências alimentares e objetivos de saúde.
            </p>
            <Button 
              onClick={generateMealPlan} 
              disabled={isGenerating}
              className="bg-nutri-green-500 hover:bg-nutri-green-600 px-8 py-3 text-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Gerando seu plano...
                </>
              ) : (
                'Gerar Plano Alimentar'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Nutricional */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-nutri-green-500" />
              Suas Metas Nutricionais Diárias
            </CardTitle>
            <Button
              onClick={generateMealPlan}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-nutri-green-600">{Math.round(mealPlan.targetCalories)}</div>
              <div className="text-sm text-gray-600">Meta Calorias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(mealPlan.targetProtein)}g</div>
              <div className="text-sm text-gray-600">Meta Proteínas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(mealPlan.targetCarbs)}g</div>
              <div className="text-sm text-gray-600">Meta Carboidratos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(mealPlan.targetFat)}g</div>
              <div className="text-sm text-gray-600">Meta Gorduras</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plano de Refeições */}
      <div className="grid gap-6">
        {mealPlan.meals.map((meal) => (
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
                      {Math.round(meal.totalCalories)} kcal
                    </div>
                  </div>
                  <Button
                    onClick={() => regenerateMeal(meal.type)}
                    disabled={isRegeneratingMeal === meal.type}
                    variant="outline"
                    size="sm"
                  >
                    <Shuffle className={`w-4 h-4 ${isRegeneratingMeal === meal.type ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {meal.foods && meal.foods.length > 0 ? (
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
                            {formatQuantity(mealFood.quantity)} • {Math.round(mealFood.calories)} kcal • TBCA-USP
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
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
                          onClick={() => substituteFoodItem(meal.type, index)}
                          disabled={isSubstituting === `${meal.type}-${index}`}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className={`w-4 h-4 ${isSubstituting === `${meal.type}-${index}` ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum alimento encontrado para esta refeição</p>
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
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total:</span>
                  <div className="font-semibold">{Math.round(meal.totalCalories)} kcal</div>
                </div>
                <div>
                  <span className="text-gray-600">Proteínas:</span>
                  <div className="font-semibold text-blue-600">{Math.round(meal.totalProtein * 10) / 10}g</div>
                </div>
                <div>
                  <span className="text-gray-600">Carboidratos:</span>
                  <div className="font-semibold text-orange-600">{Math.round(meal.totalCarbs * 10) / 10}g</div>
                </div>
                <div>
                  <span className="text-gray-600">Gorduras:</span>
                  <div className="font-semibold text-purple-600">{Math.round(meal.totalFat * 10) / 10}g</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo do Dia */}
      {mealPlan.meals.length > 0 && (
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
                  {Math.round(mealPlan.totalCalories)}
                </div>
                <div className="text-sm text-gray-600">Total de Calorias</div>
                <div className="text-xs text-gray-500">Meta: {Math.round(mealPlan.targetCalories)}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(mealPlan.totalProtein)}g
                </div>
                <div className="text-sm text-gray-600">Total de Proteínas</div>
                <div className="text-xs text-gray-500">Meta: {Math.round(mealPlan.targetProtein)}g</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(mealPlan.totalCarbs)}g
                </div>
                <div className="text-sm text-gray-600">Total de Carboidratos</div>
                <div className="text-xs text-gray-500">Meta: {Math.round(mealPlan.targetCarbs)}g</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(mealPlan.totalFat)}g
                </div>
                <div className="text-sm text-gray-600">Total de Gorduras</div>
                <div className="text-xs text-gray-500">Meta: {Math.round(mealPlan.targetFat)}g</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanGenerator;
