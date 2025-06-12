interface NutritionalProfile {
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity_level: string;
  goal: string;
}

interface NutritionalNeeds {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const calculateNutritionalNeeds = (profile: NutritionalProfile): NutritionalNeeds => {
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number;
  
  if (profile.gender === 'masculino') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  // Activity level multipliers
  const activityMultipliers = {
    'sedentario': 1.2,
    'leve': 1.375,
    'moderado': 1.55,
    'intenso': 1.725,
    'muito-intenso': 1.9
  };

  const activityMultiplier = activityMultipliers[profile.activity_level as keyof typeof activityMultipliers] || 1.2;
  let calories = bmr * activityMultiplier;

  // Adjust calories based on goal
  switch (profile.goal) {
    case 'emagrecimento':
      calories = calories * 0.8; // 20% deficit
      break;
    case 'ganho-massa':
      calories = calories * 1.15; // 15% surplus
      break;
    case 'manutencao':
    default:
      // Keep calculated calories
      break;
  }

  // Calculate macronutrient distribution
  // Protein: 1.6-2.2g per kg body weight (average 1.8g)
  const protein = profile.weight * 1.8;
  
  // Fat: 25-30% of total calories (average 27.5%)
  const fatCalories = calories * 0.275;
  const fat = fatCalories / 9; // 9 calories per gram of fat
  
  // Carbs: remaining calories
  const proteinCalories = protein * 4; // 4 calories per gram of protein
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbs = carbCalories / 4; // 4 calories per gram of carbs

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
};
