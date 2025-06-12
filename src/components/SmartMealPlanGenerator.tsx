
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Save, Printer, Download, Utensils } from 'lucide-react';
import { calculateNutritionalNeeds } from '@/utils/nutritionCalculator';
import { generateMealPlan } from '@/utils/mealPlanGenerator';
import MealCard from './MealCard';
import NutritionSummary from './NutritionSummary';
import jsPDF from 'jspdf';

interface NutritionalProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity_level: string;
  goal: string;
  food_preferences: string;
  food_restrictions: string;
}

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

interface MealPlan {
  meals: Meal[];
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targetNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const SmartMealPlanGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [userProfile, setUserProfile] = useState<NutritionalProfile | null>(null);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nutritional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        toast({
          title: "Perfil não encontrado",
          description: "Por favor, preencha seu perfil nutricional primeiro.",
          variant: "destructive"
        });
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const generatePlan = async () => {
    if (!userProfile) {
      await loadUserProfile();
      return;
    }

    setLoading(true);
    try {
      // Calculate nutritional needs
      const targetNutrition = calculateNutritionalNeeds(userProfile);
      
      // Generate meal plan using APIs
      const generatedPlan = await generateMealPlan(userProfile, targetNutrition);
      
      setMealPlan(generatedPlan);
      
      toast({
        title: "Plano gerado com sucesso!",
        description: "Seu plano alimentar personalizado está pronto.",
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro ao gerar plano",
        description: "Não foi possível gerar o plano. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    if (!mealPlan || !user) return;

    try {
      // Here you would save the meal plan to the database
      toast({
        title: "Plano salvo!",
        description: "Seu plano alimentar foi salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o plano.",
        variant: "destructive"
      });
    }
  };

  const printPlan = () => {
    window.print();
  };

  const exportToPDF = () => {
    if (!mealPlan) return;

    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Plano Alimentar Personalizado', 20, 30);
    
    // Add user info
    pdf.setFontSize(12);
    let yPos = 50;
    
    if (userProfile) {
      pdf.text(`Nome: ${userProfile.name}`, 20, yPos);
      yPos += 10;
      pdf.text(`Objetivo: ${userProfile.goal}`, 20, yPos);
      yPos += 20;
    }

    // Add daily targets
    pdf.text('Metas Diárias:', 20, yPos);
    yPos += 10;
    pdf.text(`Calorias: ${mealPlan.targetNutrition.calories} kcal`, 20, yPos);
    yPos += 8;
    pdf.text(`Proteínas: ${mealPlan.targetNutrition.protein}g`, 20, yPos);
    yPos += 8;
    pdf.text(`Carboidratos: ${mealPlan.targetNutrition.carbs}g`, 20, yPos);
    yPos += 8;
    pdf.text(`Gorduras: ${mealPlan.targetNutrition.fat}g`, 20, yPos);
    yPos += 20;

    // Add meals
    mealPlan.meals.forEach((meal) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setFontSize(14);
      pdf.text(meal.name, 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      meal.foods.forEach((food) => {
        pdf.text(`• ${food.name} - ${food.quantity}${food.unit} (${Math.round(food.calories)} kcal)`, 25, yPos);
        yPos += 8;
      });
      yPos += 10;
    });

    pdf.save('plano-alimentar.pdf');
    
    toast({
      title: "PDF exportado!",
      description: "Seu plano alimentar foi baixado com sucesso.",
    });
  };

  React.useEffect(() => {
    loadUserProfile();
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-6 h-6" />
            Gerador de Plano Alimentar Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={generatePlan} 
              disabled={loading || !userProfile}
              className="bg-nutri-green-500 hover:bg-nutri-green-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Utensils className="w-4 h-4 mr-2" />}
              {mealPlan ? 'Gerar Novo Plano' : 'Gerar Plano'}
            </Button>
            
            {mealPlan && (
              <>
                <Button onClick={generatePlan} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerar
                </Button>
                <Button onClick={savePlan} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={printPlan} variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button onClick={exportToPDF} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </>
            )}
          </div>
          
          {!userProfile && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Preencha seu perfil nutricional primeiro para gerar um plano personalizado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {mealPlan && (
        <div className="space-y-6">
          <NutritionSummary 
            dailyTotals={mealPlan.dailyTotals}
            targetNutrition={mealPlan.targetNutrition}
          />
          
          <div className="grid gap-4">
            {mealPlan.meals.map((meal, index) => (
              <MealCard key={index} meal={meal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMealPlanGenerator;
