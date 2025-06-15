
import { foodDataService, FoodItem } from './foodDataService';

export interface UserProfile {
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: 'masculino' | 'feminino' | 'outros';
  activityLevel: 'sedentario' | 'leve' | 'moderado' | 'intenso';
  goal: 'emagrecimento' | 'manutencao' | 'ganho-massa';
  foodPreferences: string[];
  foodRestrictions: string[];
}

export interface MealPlan {
  id: string;
  userId: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface Meal {
  id: string;
  type: 'cafe-da-manha' | 'lanche-manha' | 'almoco' | 'lanche-tarde' | 'jantar' | 'ceia';
  name: string;
  time: string;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  recipes?: Recipe[];
}

export interface MealFood {
  food: FoodItem;
  quantity: number; // em gramas
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // minutos
  difficulty: 'facil' | 'medio' | 'dificil';
}

class MealPlanGenerator {
  private calculateBMR(profile: UserProfile): number {
    // Fórmula de Harris-Benedict
    let bmr: number;
    
    if (profile.gender === 'masculino') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }

    // Fator de atividade
    const activityMultipliers = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725
    };

    const tdee = bmr * activityMultipliers[profile.activityLevel];

    // Ajuste baseado no objetivo
    switch (profile.goal) {
      case 'emagrecimento':
        return tdee * 0.8; // Déficit de 20%
      case 'ganho-massa':
        return tdee * 1.1; // Superávit de 10%
      default:
        return tdee; // Manutenção
    }
  }

  private calculateMacros(calories: number, goal: string) {
    let proteinPercent: number, carbPercent: number, fatPercent: number;

    switch (goal) {
      case 'emagrecimento':
        proteinPercent = 0.30;
        carbPercent = 0.40;
        fatPercent = 0.30;
        break;
      case 'ganho-massa':
        proteinPercent = 0.25;
        carbPercent = 0.45;
        fatPercent = 0.30;
        break;
      default: // manutenção
        proteinPercent = 0.20;
        carbPercent = 0.50;
        fatPercent = 0.30;
    }

    return {
      protein: (calories * proteinPercent) / 4, // 4 cal/g
      carbs: (calories * carbPercent) / 4, // 4 cal/g
      fat: (calories * fatPercent) / 9 // 9 cal/g
    };
  }

  async generateMealPlan(profile: UserProfile): Promise<MealPlan> {
    const targetCalories = this.calculateBMR(profile);
    const macros = this.calculateMacros(targetCalories, profile.goal);

    // Distribuição de calorias por refeição
    const mealDistribution = {
      'cafe-da-manha': 0.25,
      'lanche-manha': 0.10,
      'almoco': 0.30,
      'lanche-tarde': 0.10,
      'jantar': 0.20,
      'ceia': 0.05
    };

    const meals: Meal[] = [];

    for (const [mealType, percentage] of Object.entries(mealDistribution)) {
      const mealCalories = targetCalories * percentage;
      const meal = await this.generateMeal(
        mealType as Meal['type'],
        mealCalories,
        macros,
        percentage,
        profile
      );
      meals.push(meal);
    }

    const totalNutrition = this.calculateTotalNutrition(meals);

    return {
      id: crypto.randomUUID(),
      userId: '', // Será preenchido quando salvar
      date: new Date().toISOString().split('T')[0],
      meals,
      ...totalNutrition,
      targetCalories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat
    };
  }

  private async generateMeal(
    type: Meal['type'],
    targetCalories: number,
    totalMacros: any,
    percentage: number,
    profile: UserProfile
  ): Promise<Meal> {
    const mealTemplates = this.getMealTemplates(type);
    const selectedTemplate = mealTemplates[Math.floor(Math.random() * mealTemplates.length)];

    const foods: MealFood[] = [];
    let remainingCalories = targetCalories;

    for (const foodCategory of selectedTemplate.categories) {
      const searchResults = await foodDataService.searchFoods(foodCategory, 10);
      
      // Filtra alimentos com base nas restrições
      const filteredFoods = this.filterFoodsByRestrictions(searchResults, profile.foodRestrictions);
      
      if (filteredFoods.length > 0) {
        const selectedFood = filteredFoods[Math.floor(Math.random() * filteredFoods.length)];
        const quantity = this.calculateOptimalQuantity(selectedFood, remainingCalories * 0.4);
        
        const mealFood: MealFood = {
          food: selectedFood,
          quantity,
          calories: (selectedFood.calories * quantity) / 100,
          protein: (selectedFood.protein * quantity) / 100,
          carbs: (selectedFood.carbs * quantity) / 100,
          fat: (selectedFood.fat * quantity) / 100
        };

        foods.push(mealFood);
        remainingCalories -= mealFood.calories;
      }
    }

    const mealNutrition = this.calculateMealNutrition(foods);
    const recipes = await this.generateRecipes(foods);

    return {
      id: crypto.randomUUID(),
      type,
      name: this.getMealName(type),
      time: this.getMealTime(type),
      foods,
      ...mealNutrition,
      recipes
    };
  }

  private getMealTemplates(type: Meal['type']) {
    const templates = {
      'cafe-da-manha': [
        { categories: ['pão integral', 'frutas', 'café', 'leite'] },
        { categories: ['aveia', 'banana', 'iogurte', 'mel'] },
        { categories: ['ovos', 'torradas', 'abacate', 'suco'] }
      ],
      'lanche-manha': [
        { categories: ['frutas', 'castanhas'] },
        { categories: ['iogurte', 'granola'] }
      ],
      'almoco': [
        { categories: ['arroz integral', 'feijão', 'frango grelhado', 'salada'] },
        { categories: ['macarrão integral', 'molho de tomate', 'carne magra', 'legumes'] },
        { categories: ['quinoa', 'salmão', 'brócolis', 'batata doce'] }
      ],
      'lanche-tarde': [
        { categories: ['frutas', 'iogurte'] },
        { categories: ['vitamina', 'aveia'] }
      ],
      'jantar': [
        { categories: ['peixe grelhado', 'legumes', 'salada verde'] },
        { categories: ['frango', 'batata doce', 'aspargos'] },
        { categories: ['tofu', 'arroz integral', 'vegetais'] }
      ],
      'ceia': [
        { categories: ['chá', 'biscoito integral'] },
        { categories: ['leite', 'aveia'] }
      ]
    };

    return templates[type] || [];
  }

  private filterFoodsByRestrictions(foods: FoodItem[], restrictions: string[]): FoodItem[] {
    if (!restrictions.length) return foods;

    return foods.filter(food => {
      return !restrictions.some(restriction => {
        const restrictionLower = restriction.toLowerCase();
        return (
          food.name.toLowerCase().includes(restrictionLower) ||
          food.allergens?.some(allergen => allergen.toLowerCase().includes(restrictionLower)) ||
          food.ingredients?.some(ingredient => ingredient.toLowerCase().includes(restrictionLower))
        );
      });
    });
  }

  private calculateOptimalQuantity(food: FoodItem, targetCalories: number): number {
    const baseQuantity = (targetCalories * 100) / food.calories;
    return Math.round(Math.max(baseQuantity, 10)); // Mínimo 10g
  }

  private calculateMealNutrition(foods: MealFood[]) {
    return foods.reduce((total, food) => ({
      totalCalories: total.totalCalories + food.calories,
      totalProtein: total.totalProtein + food.protein,
      totalCarbs: total.totalCarbs + food.carbs,
      totalFat: total.totalFat + food.fat
    }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });
  }

  private calculateTotalNutrition(meals: Meal[]) {
    return meals.reduce((total, meal) => ({
      totalCalories: total.totalCalories + meal.totalCalories,
      totalProtein: total.totalProtein + meal.totalProtein,
      totalCarbs: total.totalCarbs + meal.totalCarbs,
      totalFat: total.totalFat + meal.totalFat
    }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });
  }

  private async generateRecipes(foods: MealFood[]): Promise<Recipe[]> {
    // Implementação simplificada - pode ser expandida com IA
    const recipes: Recipe[] = [];
    
    if (foods.length >= 2) {
      recipes.push({
        id: crypto.randomUUID(),
        name: `Receita com ${foods[0].food.name}`,
        ingredients: foods.map(f => `${f.quantity}g de ${f.food.name}`),
        instructions: [
          'Prepare os ingredientes',
          'Combine conforme preferir',
          'Sirva imediatamente'
        ],
        prepTime: 15,
        difficulty: 'facil'
      });
    }

    return recipes;
  }

  private getMealName(type: Meal['type']): string {
    const names = {
      'cafe-da-manha': 'Café da Manhã',
      'lanche-manha': 'Lanche da Manhã',
      'almoco': 'Almoço',
      'lanche-tarde': 'Lanche da Tarde',
      'jantar': 'Jantar',
      'ceia': 'Ceia'
    };
    return names[type];
  }

  private getMealTime(type: Meal['type']): string {
    const times = {
      'cafe-da-manha': '07:00',
      'lanche-manha': '10:00',
      'almoco': '12:00',
      'lanche-tarde': '15:00',
      'jantar': '19:00',
      'ceia': '21:00'
    };
    return times[type];
  }
}

export const mealPlanGenerator = new MealPlanGenerator();
