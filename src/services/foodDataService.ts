
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
  rating?: number;
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
      
      // Filtrar e validar dados
      const filteredResults = this.filterAndValidateFoods(allResults);
      
      return filteredResults.slice(0, maxResults);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      return [];
    }
  }

  private filterAndValidateFoods(foods: FoodItem[]): FoodItem[] {
    return foods
      .filter(food => this.hasRelevantInformation(food))
      .filter(food => this.isValidNutritionalData(food))
      .map(food => this.formatFoodData(food))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Ordenar por melhor avaliação
  }

  private hasRelevantInformation(food: FoodItem): boolean {
    // Verificar se o alimento tem informações básicas essenciais
    if (!food.name || food.name.trim().length < 3) return false;
    if (food.calories === undefined || food.calories === null) return false;
    if (food.protein === undefined || food.protein === null) return false;
    if (food.carbs === undefined || food.carbs === null) return false;
    if (food.fat === undefined || food.fat === null) return false;
    
    return true;
  }

  private isValidNutritionalData(food: FoodItem): boolean {
    // Filtrar dados nutricionais "bugados"
    
    // Verificar se as calorias são realistas (entre 0 e 900 kcal/100g)
    if (food.calories < 0 || food.calories > 900) return false;
    
    // Verificar se os valores não têm muitas casas decimais (indicativo de dados corrompidos)
    const hasExcessiveDecimals = (value: number) => {
      const decimals = value.toString().split('.')[1];
      return decimals && decimals.length > 2;
    };
    
    if (hasExcessiveDecimals(food.calories)) return false;
    if (hasExcessiveDecimals(food.protein)) return false;
    if (hasExcessiveDecimals(food.carbs)) return false;
    if (hasExcessiveDecimals(food.fat)) return false;
    
    // Verificar se a soma dos macronutrientes é realista
    const totalMacros = (food.protein * 4) + (food.carbs * 4) + (food.fat * 9);
    if (Math.abs(totalMacros - food.calories) > food.calories * 0.5) {
      // Se a diferença for muito grande, pode ser dado incorreto
      return false;
    }
    
    // Verificar valores negativos
    if (food.protein < 0 || food.carbs < 0 || food.fat < 0) return false;
    
    return true;
  }

  private formatFoodData(food: FoodItem): FoodItem {
    // Formatar dados para apresentação adequada
    return {
      ...food,
      name: this.formatFoodName(food.name),
      calories: Math.round(food.calories * 10) / 10, // 1 casa decimal
      protein: Math.round(food.protein * 10) / 10,
      carbs: Math.round(food.carbs * 10) / 10,
      fat: Math.round(food.fat * 10) / 10,
      fiber: food.fiber ? Math.round(food.fiber * 10) / 10 : undefined,
      sugar: food.sugar ? Math.round(food.sugar * 10) / 10 : undefined,
      sodium: food.sodium ? Math.round(food.sodium) : undefined, // mg sem decimais
      category: food.category ? this.translateCategory(food.category) : undefined,
      allergens: food.allergens ? this.translateAllergens(food.allergens) : [],
      ingredients: food.ingredients ? this.translateIngredients(food.ingredients) : []
    };
  }

  private formatFoodName(name: string): string {
    // Capitalizar primeira letra e limpar o nome
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().trim();
  }

  private translateCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'cereals': 'Cereais',
      'legumes': 'Leguminosas', 
      'fruits': 'Frutas',
      'meat': 'Carnes',
      'vegetables': 'Hortaliças',
      'dairy': 'Laticínios',
      'eggs': 'Ovos',
      'tubers': 'Tubérculos',
      'bakery': 'Panificados',
      'beverages': 'Bebidas',
      'oils': 'Óleos e Gorduras',
      'nuts': 'Nozes e Sementes',
      'fish': 'Peixes e Frutos do Mar',
      'sweets': 'Doces e Açúcares'
    };
    
    return categoryMap[category.toLowerCase()] || category;
  }

  private translateAllergens(allergens: string[]): string[] {
    const allergenMap: { [key: string]: string } = {
      'gluten': 'Glúten',
      'milk': 'Leite',
      'eggs': 'Ovos',
      'soy': 'Soja',
      'nuts': 'Nozes',
      'peanuts': 'Amendoim',
      'fish': 'Peixe',
      'shellfish': 'Crustáceos',
      'sesame': 'Gergelim',
      'sulfites': 'Sulfitos'
    };
    
    return allergens.map(allergen => 
      allergenMap[allergen.toLowerCase()] || allergen
    );
  }

  private translateIngredients(ingredients: string[]): string[] {
    // Traduzir ingredientes comuns
    const ingredientMap: { [key: string]: string } = {
      'water': 'água',
      'sugar': 'açúcar',
      'salt': 'sal',
      'flour': 'farinha',
      'oil': 'óleo',
      'milk': 'leite',
      'eggs': 'ovos',
      'butter': 'manteiga',
      'yeast': 'fermento',
      'vanilla': 'baunilha'
    };
    
    return ingredients.map(ingredient => {
      const lowerIngredient = ingredient.toLowerCase();
      return ingredientMap[lowerIngredient] || ingredient;
    });
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
      
      // Adicionar imagens padrão e rating para alimentos brasileiros
      const foodsWithImagesAndRating = (data?.foods || []).map((food: FoodItem) => ({
        ...food,
        image: this.getDefaultBrazilianFoodImage(food.name),
        rating: 5 // TBCA tem dados de alta qualidade
      }));
      
      return foodsWithImagesAndRating;
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
      
      // Marcar origem dos dados e adicionar rating baseado na qualidade
      const foodsWithSource = (data?.foods || []).map((food: FoodItem) => ({
        ...food,
        source: 'Open Food Facts',
        rating: this.calculateOpenFoodRating(food)
      }));
      
      return foodsWithSource;
    } catch (error) {
      console.error('Erro Open Food Facts API:', error);
      return [];
    }
  }

  private calculateOpenFoodRating(food: FoodItem): number {
    let rating = 3; // Base rating
    
    // Aumentar rating se tem informações completas
    if (food.fiber !== undefined) rating += 0.5;
    if (food.sugar !== undefined) rating += 0.5;
    if (food.sodium !== undefined) rating += 0.5;
    if (food.ingredients && food.ingredients.length > 0) rating += 0.5;
    if (food.brand) rating += 0.5;
    
    return Math.min(rating, 5);
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
