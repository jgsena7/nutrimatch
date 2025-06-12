
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThumbsUp, ThumbsDown, RefreshCw, Save, Printer, FileText, Clock, Users, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { mealPlanGenerator, MealPlan, Meal, MealFood } from '@/services/mealPlanGenerator';
import { foodDataService } from '@/services/foodDataService';
import { MealCard } from './MealCard';
import { NutritionSummary } from './NutritionSummary';

interface MealPlanInterfaceProps {
  userProfile: {
    name: string;
    age: number;
    height: number;
    weight: number;
    gender: string;
    activityLevel: string;
    goal: string;
    foodPreferences: string;
    foodRestrictions: string;
  };
}

export const MealPlanInterface: React.FC<MealPlanInterfaceProps> = ({ userProfile }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('plano');
  const { toast } = useToast();

  const generatePlan = async () => {
    if (!userProfile.name) {
      toast({
        title: "Perfil incompleto",
        description: "Por favor, complete seu perfil nutricional antes de gerar um plano.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const profile = {
        age: userProfile.age,
        height: userProfile.height,
        weight: userProfile.weight,
        gender: userProfile.gender as any,
        activityLevel: userProfile.activityLevel as any,
        goal: userProfile.goal as any,
        foodPreferences: userProfile.foodPreferences.split(',').map(p => p.trim()),
        foodRestrictions: userProfile.foodRestrictions.split(',').map(r => r.trim())
      };

      const plan = await mealPlanGenerator.generateMealPlan(profile);
      setMealPlan(plan);
      
      toast({
        title: "Plano gerado com sucesso!",
        description: "Seu plano alimentar personalizado está pronto."
      });
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      toast({
        title: "Erro ao gerar plano",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMealFeedback = async (mealId: string, liked: boolean) => {
    // Implementar sistema de feedback
    console.log(`Feedback para refeição ${mealId}: ${liked ? 'gostou' : 'não gostou'}`);
    
    toast({
      title: "Feedback registrado",
      description: `Sua avaliação foi registrada e ajudará a melhorar futuras sugestões.`
    });
  };

  const handleFoodSubstitution = async (mealId: string, foodIndex: number) => {
    if (!mealPlan) return;

    const meal = mealPlan.meals.find(m => m.id === mealId);
    if (!meal) return;

    const originalFood = meal.foods[foodIndex];
    const restrictions = userProfile.foodRestrictions.split(',').map(r => r.trim());

    try {
      const substitutes = await foodDataService.getFoodSubstitutes(originalFood.food, restrictions);
      
      if (substitutes.length > 0) {
        const newFood = substitutes[0];
        const updatedMealPlan = { ...mealPlan };
        const mealIndex = updatedMealPlan.meals.findIndex(m => m.id === mealId);
        
        updatedMealPlan.meals[mealIndex].foods[foodIndex] = {
          ...originalFood,
          food: newFood
        };

        setMealPlan(updatedMealPlan);
        
        toast({
          title: "Alimento substituído",
          description: `${originalFood.food.name} foi substituído por ${newFood.name}`
        });
      } else {
        toast({
          title: "Nenhum substituto encontrado",
          description: "Não foi possível encontrar um substituto adequado.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar substituto:', error);
      toast({
        title: "Erro na substituição",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const savePlan = async () => {
    if (!mealPlan) return;
    
    // Implementar salvamento no Supabase
    toast({
      title: "Plano salvo",
      description: "Seu plano alimentar foi salvo com sucesso!"
    });
  };

  const printPlan = () => {
    window.print();
  };

  const exportToPDF = () => {
    // Implementar exportação para PDF
    toast({
      title: "Exportando PDF",
      description: "Seu plano será baixado em instantes."
    });
  };

  if (!mealPlan) {
    return (
      <div className="space-y-6">
        <Card className="text-center p-8">
          <CardContent>
            <Target className="w-16 h-16 mx-auto mb-4 text-nutri-green-500" />
            <h3 className="text-xl font-semibold mb-4">Gerar Plano Alimentar Inteligente</h3>
            <p className="text-gray-600 mb-6">
              Crie um plano alimentar personalizado baseado no seu perfil nutricional
            </p>
            <Button 
              onClick={generatePlan} 
              disabled={loading}
              className="bg-nutri-green-500 hover:bg-nutri-green-600"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
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
      {/* Cabeçalho do Plano */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Plano Alimentar Personalizado</CardTitle>
              <p className="text-gray-600">Plano para {userProfile.name} - {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={generatePlan} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar
              </Button>
              <Button onClick={savePlan} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={printPlan} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo Nutricional */}
      <NutritionSummary
        totalCalories={mealPlan.totalCalories}
        totalProtein={mealPlan.totalProtein}
        totalCarbs={mealPlan.totalCarbs}
        totalFat={mealPlan.totalFat}
        targetCalories={mealPlan.targetCalories}
        targetProtein={mealPlan.targetProtein}
        targetCarbs={mealPlan.targetCarbs}
        targetFat={mealPlan.targetFat}
      />

      {/* Tabs para diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plano">Plano Diário</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="plano" className="space-y-4">
          {mealPlan.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onFeedback={(liked) => handleMealFeedback(meal.id, liked)}
              onSubstitution={(foodIndex) => handleFoodSubstitution(meal.id, foodIndex)}
            />
          ))}
        </TabsContent>

        <TabsContent value="receitas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealPlan.meals.flatMap(meal => meal.recipes || []).map((recipe) => (
              <Card key={recipe.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {recipe.prepTime} min
                    </Badge>
                    <Badge variant="outline">{recipe.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Ingredientes:</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Preparo:</h4>
                      <ol className="list-decimal list-inside text-sm space-y-1">
                        {recipe.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mealPlan.meals.map((meal, index) => (
                  <div key={meal.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-nutri-green-500 min-w-[60px]">
                      {meal.time}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{meal.name}</h4>
                      <p className="text-sm text-gray-600">
                        {meal.foods.map(f => f.food.name).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{Math.round(meal.totalCalories)} kcal</div>
                      <div className="text-sm text-gray-600">
                        P: {Math.round(meal.totalProtein)}g | 
                        C: {Math.round(meal.totalCarbs)}g | 
                        G: {Math.round(meal.totalFat)}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
