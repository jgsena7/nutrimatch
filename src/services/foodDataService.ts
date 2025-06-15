
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
  source?: string;
  rating?: number;
}

class FoodDataService {
  async searchFoods(query: string, maxResults: number = 20): Promise<FoodItem[]> {
    try {
      // Usar apenas TBCA-USP para maior velocidade e dados brasileiros
      const tbcaResults = await this.searchTBCA(query, maxResults);
      
      // Filtrar e validar dados
      const filteredResults = this.filterAndValidateFoods(tbcaResults);
      
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
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  private hasRelevantInformation(food: FoodItem): boolean {
    if (!food.name || food.name.trim().length < 3) return false;
    if (food.calories === undefined || food.calories === null) return false;
    if (food.protein === undefined || food.protein === null) return false;
    if (food.carbs === undefined || food.carbs === null) return false;
    if (food.fat === undefined || food.fat === null) return false;
    
    return true;
  }

  private isValidNutritionalData(food: FoodItem): boolean {
    // Verificar se as calorias são realistas (entre 0 e 900 kcal/100g)
    if (food.calories < 0 || food.calories > 900) return false;
    
    // Verificar se os valores não têm muitas casas decimais
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
      return false;
    }
    
    // Verificar valores negativos
    if (food.protein < 0 || food.carbs < 0 || food.fat < 0) return false;
    
    return true;
  }

  private formatFoodData(food: FoodItem): FoodItem {
    return {
      ...food,
      name: this.formatFoodName(food.name),
      calories: Math.round(food.calories * 10) / 10,
      protein: Math.round(food.protein * 10) / 10,
      carbs: Math.round(food.carbs * 10) / 10,
      fat: Math.round(food.fat * 10) / 10,
      fiber: food.fiber ? Math.round(food.fiber * 10) / 10 : undefined,
      sugar: food.sugar ? Math.round(food.sugar * 10) / 10 : undefined,
      sodium: food.sodium ? Math.round(food.sodium) : undefined,
      category: food.category ? this.translateCategory(food.category) : undefined,
      allergens: food.allergens ? this.translateAllergens(food.allergens) : [],
      ingredients: food.ingredients ? this.translateIngredients(food.ingredients) : []
    };
  }

  private formatFoodName(name: string): string {
    // Remover a palavra "cru" e variações
    const cleanName = name
      .replace(/,\s*cru\s*$/gi, '') // Remove ", cru" no final
      .replace(/,\s*crua\s*$/gi, '') // Remove ", crua" no final
      .replace(/\s+cru\s*$/gi, '') // Remove " cru" no final
      .replace(/\s+crua\s*$/gi, '') // Remove " crua" no final
      .replace(/\s+cruas\s*$/gi, '') // Remove " cruas" no final
      .replace(/\s+crus\s*$/gi, '') // Remove " crus" no final
      .trim();
    
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
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
      
      const foods = data?.foods || [];
      
      // Retornar alimentos sem imagens
      const foodsWithoutImages = foods.map((food: FoodItem) => ({
        ...food,
        rating: 5 // TBCA tem dados de alta qualidade
      }));
      
      return foodsWithoutImages;
    } catch (error) {
      console.error('Erro TBCA API:', error);
      return [];
    }
  }

  async getFoodSubstitutes(originalFood: FoodItem, restrictions: string[] = []): Promise<FoodItem[]> {
    // Busca substitutos com perfil nutricional similar usando apenas TBCA
    const calorieRange = 50;
    const proteinRange = 5;
    
    try {
      // Buscar alimentos similares da TBCA
      const similarFoods = await this.searchTBCA(originalFood.category || 'alimento', 10);
      
      return similarFoods.filter(food => {
        // Filtrar por calorias similares
        const calorieMatch = Math.abs(food.calories - originalFood.calories) <= calorieRange;
        // Filtrar por proteínas similares
        const proteinMatch = Math.abs(food.protein - originalFood.protein) <= proteinRange;
        // Excluir o alimento original
        const notSame = food.id !== originalFood.id;
        // Verificar restrições
        const passesRestrictions = !restrictions.some(restriction =>
          food.name.toLowerCase().includes(restriction.toLowerCase())
        );
        
        return calorieMatch && proteinMatch && notSame && passesRestrictions;
      }).slice(0, 3);
    } catch (error) {
      console.error('Erro ao buscar substitutos:', error);
      return [];
    }
  }
}

export const foodDataService = new FoodDataService();
