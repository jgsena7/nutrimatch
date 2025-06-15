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
  type: 'cafe-da-manha' | 'lanche-manha' | 'almoco' | 'lanche-tarde' | 'jantar';
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

const mealDistribution: { [key in Meal['type']]: number } = {
  'cafe-da-manha': 0.25,
  'lanche-manha': 0.10,
  'almoco': 0.30,
  'lanche-tarde': 0.10,
  'jantar': 0.25, // 20% normalmente, use 25% para cobrir 100% se não houver 'ceia'
};

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

  // Sistema robusto contra refeições vazias
  private getFallbackFoods(): FoodItem[] {
    return [
      {
        id: 'fallback_1',
        name: 'Arroz, polido, cru',
        calories: 358,
        protein: 7.2,
        carbs: 78.8,
        fat: 0.5,
        fiber: 1.6,
        category: 'Cereais',
        source: 'TBCA'
      },
      {
        id: 'fallback_2',
        name: 'Feijão, carioca, cru',
        calories: 329,
        protein: 20.9,
        carbs: 61.2,
        fat: 1.3,
        fiber: 18.4,
        category: 'Leguminosas',
        source: 'TBCA'
      },
      {
        id: 'fallback_3',
        name: 'Frango, peito, sem pele, cru',
        calories: 163,
        protein: 30.2,
        carbs: 0.0,
        fat: 3.6,
        fiber: 0.0,
        category: 'Carnes',
        source: 'TBCA'
      },
      {
        id: 'fallback_4',
        name: 'Banana, nanica, crua',
        calories: 92,
        protein: 1.3,
        carbs: 23.8,
        fat: 0.1,
        fiber: 2.6,
        category: 'Frutas',
        source: 'TBCA'
      },
      {
        id: 'fallback_5',
        name: 'Batata, inglesa, crua',
        calories: 52,
        protein: 1.9,
        carbs: 11.9,
        fat: 0.1,
        fiber: 1.3,
        category: 'Tubérculos',
        source: 'TBCA'
      },
      {
        id: 'fallback_6',
        name: 'Ovo, galinha, inteiro, cru',
        calories: 143,
        protein: 13.0,
        carbs: 1.6,
        fat: 8.9,
        fiber: 0.0,
        category: 'Ovos',
        source: 'TBCA'
      }
    ];
  }

  async generateMealPlan(
    profile: UserProfile,
    customGoals?: { calories: number; protein: number; carbs: number; fat: number }
  ): Promise<MealPlan> {
    // Use as metas customizadas se fornecidas, se não calcular normalmente
    const targetCalories = customGoals?.calories ?? this.calculateBMR(profile);
    const macros = customGoals
      ? {
          protein: customGoals.protein,
          carbs: customGoals.carbs,
          fat: customGoals.fat,
        }
      : this.calculateMacros(targetCalories, profile.goal);

    // Vamos filtrar preferências e restrições em todas as refeições!
    // Ao passar profile.foodPreferences com valores como "vegano" ou "low carb", aplicaremos regras especiais
    const meals: Meal[] = [];

    for (const [mealType, percentage] of Object.entries(mealDistribution)) {
      // Passar profile para generateMeal para que ele aproveite os filtros abaixo
      const meal = await this.generateMeal(
        mealType as Meal['type'],
        targetCalories * percentage,
        macros,
        percentage,
        profile
      );
      meals.push(meal);
    }

    const totalNutrition = this.calculateTotalNutrition(meals);

    return {
      id: crypto.randomUUID(),
      userId: '',
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
    const mealTemplates = this.getMealTemplates(type, profile.foodPreferences);
    const selectedTemplate = mealTemplates[Math.floor(Math.random() * mealTemplates.length)];

    const foods: MealFood[] = [];
    let remainingCalories = targetCalories;
    let attempts = 0;
    const maxAttempts = 3;

    // Sistema robusto com retry automático
    for (const foodCategory of selectedTemplate.categories) {
      let searchResults: FoodItem[] = [];
      attempts = 0;

      // Tentar buscar com termo original
      while (searchResults.length === 0 && attempts < maxAttempts) {
        try {
          let searchTerm = foodCategory;
          // Adaptação para preferências
          if (profile.foodPreferences.includes('vegano')) {
            // Adicionar termos veganos automaticamente
            if (foodCategory === 'carne' || foodCategory === 'frango' || foodCategory === 'peixe' || foodCategory === 'ovos' || foodCategory === 'leite' || foodCategory === 'iogurte') {
              searchTerm = 'tofu'; // Exemplo: tofu para fonte de proteína
            }
          }
          if (profile.foodPreferences.includes('low carb')) {
            // Trocar cereais por ovos/carnes ou frutas de baixo carbo
            if (foodCategory === 'arroz' || foodCategory === 'pão' || foodCategory === 'batata' || foodCategory === 'macarrão') {
              searchTerm = 'ovos';
            }
            if (foodCategory === 'frutas') {
              searchTerm = 'abacate'; // fruta low carb
            }
          }

          if (attempts === 0) {
            searchResults = await foodDataService.searchFoods(searchTerm, 10);
          } else if (attempts === 1) {
            const genericTerm = this.getGenericTerm(searchTerm);
            searchResults = await foodDataService.searchFoods(genericTerm, 10);
          } else {
            const fallbackFoods = this.getFallbackFoods();
            const categoryFallback = this.getCategoryFallback(searchTerm);
            searchResults = fallbackFoods.filter(food => 
              food.category?.toLowerCase().includes(categoryFallback.toLowerCase()) ||
              food.name.toLowerCase().includes(categoryFallback.toLowerCase())
            );
            if (searchResults.length === 0) {
              searchResults = [fallbackFoods[0]];
            }
          }
          attempts++;
        } catch (error) {
          console.error(`Erro na busca (tentativa ${attempts + 1}):`, error);
          attempts++;
        }
      }
      
      // Filtra alimentos com base nas restrições
      let filteredFoods = this.filterFoodsByRestrictions(searchResults, profile.foodRestrictions);

      // Filtros especiais para dieta vegana
      if (profile.foodPreferences.includes('vegano')) {
        filteredFoods = filteredFoods.filter(food =>
          !/carne|frango|peixe|aves|leite|derivados|ovo|iogurte|laticínio/i.test(food.name)
          && !/(carnes?|frangos?|peixes?|ovos?|iogurtes?|laticínios?)/i.test(food.category || '')
        );
      }

      // Filtros especiais para low carb (ignora cereais e frutas ricas em carboidratos)
      if (profile.foodPreferences.includes('low carb')) {
        filteredFoods = filteredFoods.filter(food =>
          (food.carbs ?? 0) <= 15 // até 15g carboidratos por 100g
        );
      }

      // Filtro para lactose
      if (profile.foodRestrictions.some(r => r.toLowerCase().includes('lactose'))) {
        filteredFoods = filteredFoods.filter(food =>
          !/leite|iogurte|queijo|manteiga|laticínio/i.test(food.name)
          && !/laticínios?/.test(food.category || '')
        );
      }

      // Filtro para glúten
      if (profile.foodRestrictions.some(r => r.toLowerCase().includes('glúten') || r.toLowerCase().includes('gluten'))) {
        filteredFoods = filteredFoods.filter(food =>
          !/trigo|pão|macarrão|cereal|gluten|glúten/i.test(food.name)
          && !/cereais|panificados/.test(food.category || '')
        );
      }

      // Alergias (ex: amendoim, castanha, soja, peixe, ovo, frutos do mar, etc)
      const commonAllergens = ['amendoim', 'soja', 'castanha', 'noz', 'peixe', 'ovo', 'fruto do mar', 'crustáceo', 'leite', 'glúten'];
      profile.foodRestrictions.forEach(restriction => {
        const r = restriction.toLowerCase();
        if (commonAllergens.some(allergen => r.includes(allergen))) {
          filteredFoods = filteredFoods.filter(food =>
            !food.name.toLowerCase().includes(r) &&
            !(food.allergens?.some(a => a.toLowerCase().includes(r))) &&
            !(food.ingredients?.some(i => i.toLowerCase().includes(r)))
          );
        }
      });

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

    // Garantir mínimo de 2 alimentos por refeição
    if (foods.length < 2) {
      const fallbackFoods = this.getFallbackFoods();
      const missingCount = 2 - foods.length;
      
      for (let i = 0; i < missingCount; i++) {
        const fallbackFood = fallbackFoods[i % fallbackFoods.length];
        const quantity = 50; // 50g padrão
        
        const mealFood: MealFood = {
          food: fallbackFood,
          quantity,
          calories: (fallbackFood.calories * quantity) / 100,
          protein: (fallbackFood.protein * quantity) / 100,
          carbs: (fallbackFood.carbs * quantity) / 100,
          fat: (fallbackFood.fat * quantity) / 100
        };

        foods.push(mealFood);
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

  private getGenericTerm(category: string): string {
    const genericMap: { [key: string]: string } = {
      'pão integral': 'pão',
      'arroz integral': 'arroz',
      'frango grelhado': 'frango',
      'carne magra': 'carne',
      'peixe grelhado': 'peixe',
      'iogurte grego': 'iogurte',
      'castanhas': 'amendoim',
      'legumes': 'cenoura',
      'salada verde': 'alface',
      'salada': 'tomate',
      'vegetais': 'brócolis',
      'vitamina': 'banana',
      'suco': 'laranja'
    };

    return genericMap[category] || category.split(' ')[0];
  }

  private getCategoryFallback(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'pão': 'cereais',
      'arroz': 'cereais',
      'aveia': 'cereais',
      'frango': 'carnes',
      'carne': 'carnes',
      'peixe': 'carnes',
      'frutas': 'frutas',
      'banana': 'frutas',
      'maçã': 'frutas',
      'leite': 'laticínios',
      'iogurte': 'laticínios',
      'ovos': 'ovos',
      'batata': 'tubérculos',
      'legumes': 'hortaliças',
      'salada': 'hortaliças',
      'vegetais': 'hortaliças'
    };

    return categoryMap[category] || 'cereais';
  }

  // Adiciona suporte para seleção de preferências ao escolher templates baseados em perfil
  private getMealTemplates(type: Meal['type'], preferences?: string[]) {
    let templates = {
      'cafe-da-manha': [
        { categories: ['pão', 'frutas', 'leite'] },
        { categories: ['aveia', 'banana', 'iogurte'] },
        { categories: ['ovos', 'pão', 'frutas'] }
      ],
      'lanche-manha': [
        { categories: ['frutas', 'amendoim'] },
        { categories: ['iogurte', 'aveia'] }
      ],
      'almoco': [
        { categories: ['arroz', 'feijão', 'frango', 'salada'] },
        { categories: ['macarrão', 'carne', 'legumes'] },
        { categories: ['arroz', 'peixe', 'brócolis', 'batata'] }
      ],
      'lanche-tarde': [
        { categories: ['frutas', 'iogurte'] },
        { categories: ['banana', 'aveia'] }
      ],
      'jantar': [
        { categories: ['peixe', 'legumes', 'salada'] },
        { categories: ['frango', 'batata', 'vegetais'] },
        { categories: ['carne', 'arroz', 'brócolis'] }
      ]
    };

    // Troca fontes animais para veganos
    if (preferences?.includes('vegano')) {
      templates = {
        'cafe-da-manha': [
          { categories: ['pão', 'frutas', 'leite vegetal'] },
          { categories: ['aveia', 'banana', 'pasta de amendoim'] }
        ],
        'lanche-manha': [
          { categories: ['frutas', 'castanha'] },
          { categories: ['leite vegetal', 'aveia'] }
        ],
        'almoco': [
          { categories: ['arroz', 'feijão', 'tofu', 'salada'] },
          { categories: ['grão-de-bico', 'legumes', 'quinoa'] }
        ],
        'lanche-tarde': [
          { categories: ['frutas', 'castanha'] }
        ],
        'jantar': [
          { categories: ['tofu', 'legumes', 'salada'] },
          { categories: ['grão-de-bico', 'vegetais'] }
        ]
      };
    }

    // Troca carboidratos para fontes low carb
    if (preferences?.includes('low carb')) {
      templates = {
        'cafe-da-manha': [
          { categories: ['ovos', 'abacate'] },
          { categories: ['frango', 'tomate'] }
        ],
        'lanche-manha': [
          { categories: ['ovos'] },
          { categories: ['castanha'] }
        ],
        'almoco': [
          { categories: ['frango', 'salada', 'abacate'] },
          { categories: ['ovos', 'legumes', 'carne'] }
        ],
        'lanche-tarde': [
          { categories: ['castanha'] },
          { categories: ['frango'] }
        ],
        'jantar': [
          { categories: ['frango', 'salada', 'abacate'] },
          { categories: ['ovos', 'vegetais'] }
        ]
      };
    }

    // Se o usuário for vegano e low carb ao mesmo tempo, opta por fontes tipo tofu, castanha, abacate
    if (preferences?.includes('vegano') && preferences?.includes('low carb')) {
      templates = {
        'cafe-da-manha': [
          { categories: ['tofu', 'abacate'] },
          { categories: ['castanha', 'abacate'] }
        ],
        'lanche-manha': [
          { categories: ['castanha'] },
          { categories: ['abacate'] }
        ],
        'almoco': [
          { categories: ['tofu', 'legumes', 'abacate'] },
          { categories: ['grão-de-bico', 'vegetais'] }
        ],
        'lanche-tarde': [
          { categories: ['castanha'] }
        ],
        'jantar': [
          { categories: ['tofu', 'abacate', 'vegetais'] },
          { categories: ['grão-de-bico', 'legumes'] }
        ]
      };
    }

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
    return Math.round(Math.max(baseQuantity, 30)); // Mínimo 30g
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
      'jantar': 'Jantar'
      // 'ceia': 'Ceia', // removido
    };
    return names[type];
  }

  private getMealTime(type: Meal['type']): string {
    const times = {
      'cafe-da-manha': '07:00',
      'lanche-manha': '10:00',
      'almoco': '12:00',
      'lanche-tarde': '15:00',
      'jantar': '19:00'
      // 'ceia': '21:00', // removido
    };
    return times[type];
  }
  
}

export const mealPlanGenerator = new MealPlanGenerator();
