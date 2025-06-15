import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, Target, Utensils, RefreshCw, ChefHat, Shuffle, Edit, FileText } from 'lucide-react';
import { mealPlanGenerator, UserProfile, MealPlan, Meal, MealFood } from '@/services/mealPlanGenerator';
import { foodDataService } from '@/services/foodDataService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import FoodSubstitutionModal from './FoodSubstitutionModal';
import EditNutritionGoalsModal from './EditNutritionGoalsModal';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [selectedFoodForSubstitution, setSelectedFoodForSubstitution] = useState<{
    mealType: string;
    foodIndex: number;
    food: any;
  } | null>(null);
  const { toast } = useToast();
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [customGoals, setCustomGoals] = useState<null | {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>(null);

  // Adicione refs para as seções a serem exportadas
  const metasRef = React.useRef<HTMLDivElement>(null);
  const planoRef = React.useRef<HTMLDivElement>(null);
  const resumoRef = React.useRef<HTMLDivElement>(null);

  // Função para exportar as seções para PDF
  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const padding = 12;
      let yOffset = 10;

      // Helper para adicionar print de uma ref na página atual do PDF
      const appendSectionToPDF = async (
        ref: React.RefObject<HTMLDivElement>,
        titulo: string
      ) => {
        if (!ref.current) return;
        // Adiciona título antes da seção
        doc.setFontSize(16);
        doc.text(titulo, padding, yOffset + 8);

        // Renderiza a ref para imagem
        const canvas = await html2canvas(ref.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
        });
        const imgData = canvas.toDataURL("image/png");
        const imgProps = doc.getImageProperties(imgData);

        // Ajusta tamanho da imagem ao PDF
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * padding;
        const aspectRatio = imgProps.height / imgProps.width;
        const pdfHeight = pdfWidth * aspectRatio;

        // Se não couber na página, quebra
        if (yOffset + 8 + pdfHeight > doc.internal.pageSize.getHeight() - padding) {
          doc.addPage();
          yOffset = 10;
          doc.setFontSize(16);
          doc.text(titulo + " (cont.)", padding, yOffset + 8);
        }
        yOffset += 10;

        doc.addImage(
          imgData,
          "PNG",
          padding,
          yOffset,
          pdfWidth,
          pdfHeight
        );
        yOffset += pdfHeight + 12;
      };

      await appendSectionToPDF(metasRef, "Metas Nutricionais Diárias");
      await appendSectionToPDF(planoRef, "Plano de Refeições (todos abertos)");
      await appendSectionToPDF(resumoRef, "Resumo do Dia");

      doc.save("plano-alimentar.pdf");
    } catch (err) {
      toast({
        title: "Falha ao exportar PDF",
        description: "Não foi possível exportar o PDF. Tente novamente.",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  useEffect(() => {
    if (userProfile && user) {
      generateMealPlan();
    }
  }, [userProfile, user]);

  // Atualiza as metas caso o usuário personalize
  const generateMealPlan = async (goalsOverride?: { calories: number; protein: number; carbs: number; fat: number }) => {
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

      // Passar metas customizadas para o generator em vez do cálculo padrão
      const plan = await mealPlanGenerator.generateMealPlan(profile, goalsOverride || undefined);

      setMealPlan(plan);

      toast({
        title: "Plano gerado com sucesso!",
        description: `Plano criado com ${Math.round(plan.totalCalories)} kcal usando dados TBCA-USP`,
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

  // Atualiza plano quando usuário salva novas metas
  const handleSaveGoals = (goals: { calories: number; protein: number; carbs: number; fat: number }) => {
    setCustomGoals(goals);
    generateMealPlan(goals);
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
          description: `${newMeal.name} foi atualizada com novos alimentos TBCA-USP.`,
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

  const openSubstitutionModal = (mealType: string, foodIndex: number) => {
    if (!mealPlan) return;
    
    const meal = mealPlan.meals.find(m => m.type === mealType);
    if (!meal || !meal.foods[foodIndex]) return;

    setSelectedFoodForSubstitution({
      mealType,
      foodIndex,
      food: meal.foods[foodIndex].food
    });
    setShowSubstitutionModal(true);
  };

  const handleFoodSubstitution = (newFood: any) => {
    if (!mealPlan || !selectedFoodForSubstitution) return;

    const { mealType, foodIndex } = selectedFoodForSubstitution;
    const meal = mealPlan.meals.find(m => m.type === mealType);
    if (!meal) return;

    const originalFood = meal.foods[foodIndex];
    
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

    setShowSubstitutionModal(false);
    setSelectedFoodForSubstitution(null);
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
            <h3 className="text-2xl font-semibold mb-4">Gerar Plano Alimentar TBCA-USP</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Crie um plano alimentar 100% brasileiro baseado na base de dados TBCA-USP, 
              com alimentos validados pela Universidade de São Paulo.
            </p>
            <Button 
              onClick={() => generateMealPlan()} 
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

  // Ajusta valores das metas
  const displayedGoals = customGoals
    ? customGoals
    : mealPlan
    ? {
        calories: Math.round(mealPlan.targetCalories),
        protein: Math.round(mealPlan.targetProtein),
        carbs: Math.round(mealPlan.targetCarbs),
        fat: Math.round(mealPlan.targetFat),
      }
    : { calories: 2000, protein: 100, carbs: 250, fat: 60 }; // defaults

  return (
    <div className="space-y-6">
      {/* Resumo Nutricional - agora com ref */}
      <div ref={metasRef}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-nutri-green-500" />
                Suas Metas Nutricionais Diárias
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowEditGoals(true)}
                  size="sm"
                  variant="outline"
                >
                  Editar Metas
                </Button>
                <Button
                  type="button"
                  onClick={handleExportPDF}
                  size="sm"
                  variant="outline"
                  title="Exportar plano para PDF"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Exportar PDF
                </Button>
                <Button
                  onClick={() => generateMealPlan(customGoals || undefined)}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Gerando Novo Plano' : 'Gerar Novo Plano'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-nutri-green-600">{displayedGoals.calories}</div>
                <div className="text-sm text-gray-600">Meta Calorias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{displayedGoals.protein}g</div>
                <div className="text-sm text-gray-600">Meta Proteínas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{displayedGoals.carbs}g</div>
                <div className="text-sm text-gray-600">Meta Carboidratos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{displayedGoals.fat}g</div>
                <div className="text-sm text-gray-600">Meta Gorduras</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Modal de edição das metas */}
      <EditNutritionGoalsModal
        open={showEditGoals}
        onClose={() => setShowEditGoals(false)}
        onSave={handleSaveGoals}
        currentGoals={displayedGoals}
      />

      {/* Accordion de Refeições - envolver com ref e abrir todos menus */}
      <div ref={planoRef}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-nutri-green-500" />
              Seu Plano de Refeições - Base TBCA-USP
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Accordion com todas refeições abertas no export */}
            <Accordion type="multiple" defaultValue={mealPlan.meals.map(m => m.type)} className="space-y-4">
              {mealPlan.meals.map((meal) => (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            regenerateMeal(meal.type);
                          }}
                          disabled={isRegeneratingMeal === meal.type}
                          variant="outline"
                          size="sm"
                        >
                          <Shuffle className={`w-3 h-3 ${isRegeneratingMeal === meal.type ? 'animate-spin' : ''}`} />
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
      </div>
      {/* Resumo do Dia - envolver com ref */}
      {mealPlan.meals.length > 0 && (
        <div ref={resumoRef}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-nutri-green-500" />
                Resumo do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Resumo cards */}
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
        </div>
      )}
      {/* Modal de Substituição */}
      {showSubstitutionModal && selectedFoodForSubstitution && (
        <FoodSubstitutionModal
          isOpen={showSubstitutionModal}
          onClose={() => {
            setShowSubstitutionModal(false);
            setSelectedFoodForSubstitution(null);
          }}
          currentFood={selectedFoodForSubstitution.food}
          onSubstitute={handleFoodSubstitution}
          restrictions={userProfile.food_restrictions ? userProfile.food_restrictions.split(",").map((r) => r.trim()) : []}
        />
      )}
    </div>
  );
};

export default MealPlanGenerator;
