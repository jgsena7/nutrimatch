
import { supabase } from "@/integrations/supabase/client";

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

interface NutritionalNeeds {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  targetNutrition: NutritionalNeeds;
}

const MEAL_DISTRIBUTION = {
  'Café da Manhã': 0.25,
  'Lanche da Manhã': 0.10,
  'Almoço': 0.35,
  'Lanche da Tarde': 0.10,
  'Jantar': 0.20
};

const searchFoodsByCategory = async (category: string, restrictions: string[]): Promise<any[]> => {
  try {
    // Search in both APIs
    const [offResponse, usdaResponse] = await Promise.allSettled([
      supabase.functions.invoke('search-food-openfoodfacts', {
        body: { query: category, page: 1 }
      }),
      supabase.functions.invoke('search-food-usda', {
        body: { query: category, page: 1 }
      })
    ]);

    let allFoods: any[] = [];

    if (offResponse.status === 'fulfilled' && offResponse.value.data) {
      allFoods = [...allFoods, ...(offResponse.value.data.products || [])];
    }

    if (usdaResponse.status === 'fulfilled' && usdaResponse.value.data) {
      allFoods = [...allFoods, ...(usdaResponse.value.data.products || [])];
    }

    // Filter out foods with restrictions
    const filteredFoods = allFoods.filter(food => {
      const foodName = food.name.toLowerCase();
      const categories = (food.categories || '').toLowerCase();
      
      return !restrictions.some(restriction => 
        foodName.includes(restriction.toLowerCase()) ||
        categories.includes(restriction.toLowerCase())
      );
    });

    return filteredFoods.slice(0, 10); // Limit to 10 foods per category
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};

const createMeal = (mealName: string, targetCalories: number, availableFoods: any[]): Meal => {
  const selectedFoods: FoodItem[] = [];
  let currentCalories = 0;
  let currentProtein = 0;
  let currentCarbs = 0;
  let currentFat = 0;

  // Randomly select foods until we reach target calories
  const shuffledFoods = [...availableFoods].sort(() => Math.random() - 0.5);
  
  for (const food of shuffledFoods) {
    if (currentCalories >= targetCalories || selectedFoods.length >= 4) break;
    
    const baseQuantity = mealName.includes('Lanche') ? 50 : 100; // Smaller portions for snacks
    const quantity = Math.round(baseQuantity + Math.random() * 50);
    
    const caloriesPerGram = food.nutrition.energy_kcal / 100;
    const foodCalories = caloriesPerGram * quantity;
    
    if (currentCalories + foodCalories <= targetCalories * 1.2) { // Allow 20% tolerance
      selectedFoods.push({
        id: food.id,
        name: food.name,
        quantity,
        unit: 'g',
        calories: Math.round(foodCalories),
        protein: Math.round((food.nutrition.proteins / 100) * quantity),
        carbs: Math.round((food.nutrition.carbohydrates / 100) * quantity),
        fat: Math.round((food.nutrition.fat / 100) * quantity),
        source: food.source
      });
      
      currentCalories += foodCalories;
      currentProtein += (food.nutrition.proteins / 100) * quantity;
      currentCarbs += (food.nutrition.carbohydrates / 100) * quantity;
      currentFat += (food.nutrition.fat / 100) * quantity;
    }
  }

  return {
    name: mealName,
    foods: selectedFoods,
    totalCalories: Math.round(currentCalories),
    totalProtein: Math.round(currentProtein),
    totalCarbs: Math.round(currentCarbs),
    totalFat: Math.round(currentFat)
  };
};

export const generateMealPlan = async (
  profile: NutritionalProfile, 
  targetNutrition: NutritionalNeeds
): Promise<MealPlan> => {
  const restrictions = profile.food_restrictions 
    ? profile.food_restrictions.split(',').map(r => r.trim())
    : [];

  // Define food categories for different meals
  const foodCategories = {
    breakfast: ['aveia', 'ovos', 'leite', 'frutas', 'pão'],
    lunch: ['frango', 'arroz', 'feijão', 'verduras', 'legumes'],
    dinner: ['peixe', 'batata', 'salada', 'vegetais'],
    snacks: ['iogurte', 'castanhas', 'frutas', 'queijo']
  };

  // Search for foods in each category
  const [breakfastFoods, lunchFoods, dinnerFoods, snackFoods] = await Promise.all([
    Promise.all(foodCategories.breakfast.map(cat => searchFoodsByCategory(cat, restrictions))),
    Promise.all(foodCategories.lunch.map(cat => searchFoodsByCategory(cat, restrictions))),
    Promise.all(foodCategories.dinner.map(cat => searchFoodsByCategory(cat, restrictions))),
    Promise.all(foodCategories.snacks.map(cat => searchFoodsByCategory(cat, restrictions)))
  ]);

  // Flatten the arrays
  const flatBreakfast = breakfastFoods.flat();
  const flatLunch = lunchFoods.flat();
  const flatDinner = dinnerFoods.flat();
  const flatSnacks = snackFoods.flat();

  // Create meals
  const meals: Meal[] = [
    createMeal('Café da Manhã', targetNutrition.calories * MEAL_DISTRIBUTION['Café da Manhã'], flatBreakfast),
    createMeal('Lanche da Manhã', targetNutrition.calories * MEAL_DISTRIBUTION['Lanche da Manhã'], flatSnacks),
    createMeal('Almoço', targetNutrition.calories * MEAL_DISTRIBUTION['Almoço'], flatLunch),
    createMeal('Lanche da Tarde', targetNutrition.calories * MEAL_DISTRIBUTION['Lanche da Tarde'], flatSnacks),
    createMeal('Jantar', targetNutrition.calories * MEAL_DISTRIBUTION['Jantar'], flatDinner)
  ];

  // Calculate daily totals
  const dailyTotals = meals.reduce((totals, meal) => ({
    calories: totals.calories + meal.totalCalories,
    protein: totals.protein + meal.totalProtein,
    carbs: totals.carbs + meal.totalCarbs,
    fat: totals.fat + meal.totalFat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return {
    meals,
    dailyTotals,
    targetNutrition
  };
};
