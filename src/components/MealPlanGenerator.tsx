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
import MainMealPlanHeader from './MainMealPlanHeader';
import MealPlanAccordion from './MealPlanAccordion';
import MealPlanSummary from './MealPlanSummary';
import { supabase } from "@/integrations/supabase/client";

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

  // Função para exportar as seções para PDF - corrigido para evitar duplicidade do título 'Seu Plano de Refeições'
  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const padding = 12;
      let yOffset = 10;

      // Helper para adicionar print de uma ref na página atual do PDF
      const appendSectionToPDF = async (
        ref: React.RefObject<HTMLDivElement>,
        titulo?: string // agora pode ser opcional
      ) => {
        if (!ref.current) return;

        // Renderiza a ref para imagem
        const canvas = await html2canvas(ref.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff" // usa o fundo branco padrão Tailwind/background
        });
        const imgData = canvas.toDataURL("image/png");
        const imgProps = doc.getImageProperties(imgData);

        // Ajusta tamanho da imagem ao PDF
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * padding;
        const aspectRatio = imgProps.height / imgProps.width;
        const pdfHeight = pdfWidth * aspectRatio;

        // Se não couber na página, quebra
        if (yOffset + pdfHeight > doc.internal.pageSize.getHeight() - padding) {
          doc.addPage();
          yOffset = 10;
        }
        if (titulo) {
          doc.setFontSize(16);
          doc.text(titulo, padding, yOffset + 8);
          yOffset += 10;
        }

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
      // Ajuste: no planoRef, NÃO passar título porque o conteúdo já inclui o título no próprio card!
      await appendSectionToPDF(planoRef, undefined);
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

  // Função para salvar (ou atualizar) o plano customizado na tabela user_meal_plans
  const saveCustomMealPlan = async (plan: MealPlan) => {
    if (!user || !userProfile) return;
    try {
      const { toast } = useToast(); // hook do toast

      // Busca o perfil nutricional já existente
      const { data: profiles, error: profilesError } = await supabase
        .from("nutritional_profiles")
        .select("id")
        .eq("user_id", user.id);

      if (profilesError || !profiles || profiles.length === 0) {
        toast({
          title: "Erro ao salvar plano",
          description: "Não foi possível encontrar seu perfil nutricional.",
          variant: "destructive",
        });
        return;
      }

      const nutritionalProfileId = profiles[0].id;

      const { error } = await supabase
        .from("user_meal_plans")
        .upsert([
          {
            user_id: user.id,
            user_profile_id: nutritionalProfileId,
            plan_date: new Date().toISOString().split("T")[0],
            plan_data: JSON.parse(JSON.stringify(plan)),
            updated_at: new Date().toISOString()
          }
        ], { onConflict: "user_id,plan_date" });

      if (error) {
        toast({
          title: "Erro ao salvar plano",
          description: error.message || "Algo deu errado ao salvar seu plano.",
          variant: "destructive"
        });
        console.error("Erro ao salvar plano customizado na Supabase:", error);
      } else {
        toast({
          title: "Plano salvo!",
          description: "Seu plano alimentar foi salvo com sucesso.",
          variant: "success"
        });
      }
    } catch (e) {
      const { toast } = useToast();
      toast({
        title: "Erro ao salvar plano",
        description: "Ocorreu um erro inesperado ao salvar seu plano.",
        variant: "destructive"
      });
      console.error("Erro inesperado ao salvar plano customizado na Supabase", e);
    }
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

    const updatedPlan = {
      ...mealPlan,
      meals: updatedMeals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };

    setMealPlan(updatedPlan);

    // SALVA O PLANO NOVO NA SUPABASE
    saveCustomMealPlan(updatedPlan);

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
      <div ref={metasRef}>
        <MainMealPlanHeader
          displayedGoals={displayedGoals}
          isGenerating={isGenerating}
          onEditGoals={() => setShowEditGoals(true)}
          onGeneratePlan={() => generateMealPlan(customGoals || undefined)}
        />
      </div>
      <EditNutritionGoalsModal
        open={showEditGoals}
        onClose={() => setShowEditGoals(false)}
        onSave={handleSaveGoals}
        currentGoals={displayedGoals}
      />
      <div ref={planoRef}>
        <MealPlanAccordion
          meals={mealPlan.meals}
          isRegeneratingMeal={isRegeneratingMeal}
          regenerateMeal={regenerateMeal}
          openSubstitutionModal={openSubstitutionModal}
          formatQuantity={formatQuantity}
        />
      </div>
      {mealPlan.meals.length > 0 && (
        <div ref={resumoRef}>
          <MealPlanSummary
            totalCalories={mealPlan.totalCalories}
            totalProtein={mealPlan.totalProtein}
            totalCarbs={mealPlan.totalCarbs}
            totalFat={mealPlan.totalFat}
            targetCalories={mealPlan.targetCalories}
            targetProtein={mealPlan.targetProtein}
            targetCarbs={mealPlan.targetCarbs}
            targetFat={mealPlan.targetFat}
          />
        </div>
      )}
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
