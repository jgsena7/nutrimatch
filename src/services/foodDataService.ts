
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

export interface CachedFood extends FoodItem {
  cached_at: string;
}

class FoodDataService {
  private cacheExpiration = 24 * 60 * 60 * 1000; // 24 horas em ms

  async searchFoods(query: string, maxResults: number = 20): Promise<FoodItem[]> {
    try {
      // Primeiro, tenta buscar no cache
      const cachedResults = await this.getCachedFoods(query);
      if (cachedResults.length > 0) {
        console.log('Retornando resultados do cache');
        return cachedResults;
      }

      // Se não encontrou no cache, busca nas APIs
      const [usdaResults, openFoodResults] = await Promise.all([
        this.searchUSDA(query, Math.ceil(maxResults / 2)),
        this.searchOpenFood(query, Math.ceil(maxResults / 2))
      ]);

      const allResults = [...usdaResults, ...openFoodResults];
      
      // Salva os resultados no cache
      await this.cacheResults(query, allResults);
      
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

      if (error) throw error;
      return data.foods || [];
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

      if (error) throw error;
      return data.foods || [];
    } catch (error) {
      console.error('Erro Open Food Facts API:', error);
      return [];
    }
  }

  private async getCachedFoods(query: string): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase
        .from('food_cache')
        .select('*')
        .ilike('search_query', `%${query}%`)
        .gte('cached_at', new Date(Date.now() - this.cacheExpiration).toISOString());

      if (error) throw error;
      
      return data?.map(item => ({
        id: item.food_id,
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        sugar: item.sugar,
        sodium: item.sodium,
        brand: item.brand,
        category: item.category,
        allergens: item.allergens,
        ingredients: item.ingredients,
        image: item.image
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar cache:', error);
      return [];
    }
  }

  private async cacheResults(query: string, foods: FoodItem[]): Promise<void> {
    try {
      const cacheData = foods.map(food => ({
        search_query: query,
        food_id: food.id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
        brand: food.brand,
        category: food.category,
        allergens: food.allergens,
        ingredients: food.ingredients,
        image: food.image,
        cached_at: new Date().toISOString()
      }));

      await supabase.from('food_cache').insert(cacheData);
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
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

      if (error) throw error;
      return data.substitutes || [];
    } catch (error) {
      console.error('Erro ao buscar substitutos:', error);
      return [];
    }
  }
}

export const foodDataService = new FoodDataService();
