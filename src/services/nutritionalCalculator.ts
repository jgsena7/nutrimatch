
export interface NutritionalNeeds {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity_level: string;
  goal: string;
  food_preferences?: string;
  food_restrictions?: string;
}

export class NutritionalCalculator {
  
  static calculateBMR(profile: UserProfile): number {
    const { age, height, weight, gender } = profile;
    
    // Fórmula Harris-Benedict revisada
    if (gender === 'masculino') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }

  static getActivityMultiplier(activityLevel: string): number {
    const multipliers = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725
    };
    return multipliers[activityLevel as keyof typeof multipliers] || 1.2;
  }

  static getGoalMultiplier(goal: string): number {
    const multipliers = {
      'emagrecimento': 0.8, // -20% das calorias
      'manutencao': 1.0,    // manter calorias
      'ganho-massa': 1.15   // +15% das calorias
    };
    return multipliers[goal as keyof typeof multipliers] || 1.0;
  }

  static calculateNutritionalNeeds(profile: UserProfile): NutritionalNeeds {
    const bmr = this.calculateBMR(profile);
    const activityMultiplier = this.getActivityMultiplier(profile.activity_level);
    const goalMultiplier = this.getGoalMultiplier(profile.goal);
    
    const totalCalories = Math.round(bmr * activityMultiplier * goalMultiplier);
    
    // Distribuição de macronutrientes baseada no objetivo
    let proteinPercentage, carbsPercentage, fatPercentage;
    
    switch (profile.goal) {
      case 'emagrecimento':
        proteinPercentage = 0.30; // 30% proteína
        carbsPercentage = 0.40;   // 40% carboidratos
        fatPercentage = 0.30;     // 30% gordura
        break;
      case 'ganho-massa':
        proteinPercentage = 0.25; // 25% proteína
        carbsPercentage = 0.50;   // 50% carboidratos
        fatPercentage = 0.25;     // 25% gordura
        break;
      default: // manutenção
        proteinPercentage = 0.20; // 20% proteína
        carbsPercentage = 0.50;   // 50% carboidratos
        fatPercentage = 0.30;     // 30% gordura
    }

    const protein = Math.round((totalCalories * proteinPercentage) / 4); // 4 kcal/g
    const carbs = Math.round((totalCalories * carbsPercentage) / 4);     // 4 kcal/g
    const fat = Math.round((totalCalories * fatPercentage) / 9);         // 9 kcal/g
    const fiber = Math.round(totalCalories / 1000 * 14); // 14g por 1000 kcal

    return {
      calories: totalCalories,
      protein,
      carbs,
      fat,
      fiber
    };
  }

  static distributeMealCalories(totalCalories: number): Record<string, number> {
    return {
      'cafe-da-manha': Math.round(totalCalories * 0.25),    // 25%
      'lanche-manha': Math.round(totalCalories * 0.10),     // 10%
      'almoco': Math.round(totalCalories * 0.30),           // 30%
      'lanche-tarde': Math.round(totalCalories * 0.10),     // 10%
      'jantar': Math.round(totalCalories * 0.20),           // 20%
      'ceia': Math.round(totalCalories * 0.05)              // 5%
    };
  }

  static getMealSchedule(): Record<string, string> {
    return {
      'cafe-da-manha': '07:00',
      'lanche-manha': '10:00',
      'almoco': '12:30',
      'lanche-tarde': '15:30',
      'jantar': '19:00',
      'ceia': '22:00'
    };
  }

  static getMealNames(): Record<string, string> {
    return {
      'cafe-da-manha': 'Café da Manhã',
      'lanche-manha': 'Lanche da Manhã',
      'almoco': 'Almoço',
      'lanche-tarde': 'Lanche da Tarde',
      'jantar': 'Jantar',
      'ceia': 'Ceia'
    };
  }
}
