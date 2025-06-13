
import { supabase } from "@/integrations/supabase/client";

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  brand?: string;
  category?: string;
  allergens?: string[];
  ingredients?: string[];
  image?: string;
}

class FoodDataService {
  async searchFoods(query: string, maxResults: number = 20): Promise<FoodItem[]> {
    try {
      // Busca nas APIs externas
      const [usdaResults, openFoodResults] = await Promise.all([
        this.searchUSDA(query, Math.ceil(maxResults / 2)),
        this.searchOpenFood(query, Math.ceil(maxResults / 2))
      ]);

      const allResults = [...usdaResults, ...openFoodResults];
      
      return allResults.slice(0, maxResults);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      return [];
    }
  }

  private async searchUSDA(query: string, maxResults: number): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-food-usda', {
        body: { query, maxResults }
      });

      if (error) {
        console.error('Erro USDA API:', error);
        return [];
      }
      return data?.foods || [];
    } catch (error) {
      console.error('Erro USDA API:', error);
      return [];
    }
  }

  private async searchOpenFood(query: string, maxResults: number): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-food-openfoodfacts', {
        body: { query, maxResults }
      });

      if (error) {
        console.error('Erro Open Food Facts API:', error);
        return [];
      }
      return data?.foods || [];
    } catch (error) {
      console.error('Erro Open Food Facts API:', error);
      return [];
    }
  }

  async getFoodSubstitutes(originalFood: FoodItem, restrictions: string[] = []): Promise<FoodItem[]> {
    // Busca substitutos com perfil nutricional similar
    const calorieRange = 50; // ±50 calorias
    const proteinRange = 5; // ±5g proteína
    
    try {
      const { data, error } = await supabase.functions.invoke('find-food-substitutes', {
        body: {
          originalFood,
          restrictions,
          calorieRange,
          proteinRange
        }
      });

      if (error) {
        console.error('Erro ao buscar substitutos:', error);
        return [];
      }
      return data?.substitutes || [];
    } catch (error) {
      console.error('Erro ao buscar substitutos:', error);
      return [];
    }
  }
}

export const foodDataService = new FoodDataService();
