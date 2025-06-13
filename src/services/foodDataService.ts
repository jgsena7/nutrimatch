
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
  source?: string;
}

class FoodDataService {
  async searchFoods(query: string, maxResults: number = 20): Promise<FoodItem[]> {
    try {
      // Busca nas APIs: TBCA (prioridade para alimentos brasileiros) e Open Food Facts
      const [tbcaResults, openFoodResults] = await Promise.all([
        this.searchTBCA(query, Math.ceil(maxResults * 0.6)), // 60% TBCA
        this.searchOpenFood(query, Math.ceil(maxResults * 0.4)) // 40% Open Food Facts
      ]);

      // Priorizar resultados da TBCA (alimentos brasileiros) e depois Open Food Facts
      const allResults = [...tbcaResults, ...openFoodResults];
      
      return allResults.slice(0, maxResults);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      return [];
    }
  }

  private async searchTBCA(query: string, maxResults: number): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-food-tbca', {
        body: { query, maxResults }
      });

      if (error) {
        console.error('Erro TBCA API:', error);
        return [];
      }
      
      // Adicionar imagens padrão para alimentos brasileiros
      const foodsWithImages = (data?.foods || []).map((food: FoodItem) => ({
        ...food,
        image: this.getDefaultBrazilianFoodImage(food.name)
      }));
      
      return foodsWithImages;
    } catch (error) {
      console.error('Erro TBCA API:', error);
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
      
      // Marcar origem dos dados
      const foodsWithSource = (data?.foods || []).map((food: FoodItem) => ({
        ...food,
        source: 'Open Food Facts'
      }));
      
      return foodsWithSource;
    } catch (error) {
      console.error('Erro Open Food Facts API:', error);
      return [];
    }
  }

  private getDefaultBrazilianFoodImage(foodName: string): string {
    const name = foodName.toLowerCase();
    
    // Mapear alimentos brasileiros para imagens do Unsplash
    if (name.includes('arroz')) {
      return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('feijão')) {
      return 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('banana')) {
      return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('frango')) {
      return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('mandioca')) {
      return 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('açaí')) {
      return 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('pão')) {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('leite')) {
      return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('ovo')) {
      return 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('batata')) {
      return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('tomate')) {
      return 'https://images.unsplash.com/photo-1546470427-e83e1f91d6cd?w=200&h=200&fit=crop&crop=center';
    }
    if (name.includes('alface')) {
      return 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&h=200&fit=crop&crop=center';
    }
    
    // Imagem padrão
    return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop&crop=center';
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
