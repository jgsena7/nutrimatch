
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 20 } = await req.json();
    
    const usdaApiKey = Deno.env.get('USDA_API_KEY');
    if (!usdaApiKey) {
      throw new Error('USDA API key not configured');
    }

    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=${maxResults}&api_key=${usdaApiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    const foods = data.foods?.map((food: any) => ({
      id: food.fdcId.toString(),
      name: food.description || 'Alimento sem nome',
      calories: food.foodNutrients?.find((n: any) => n.nutrientId === 1008)?.value || 0,
      protein: food.foodNutrients?.find((n: any) => n.nutrientId === 1003)?.value || 0,
      carbs: food.foodNutrients?.find((n: any) => n.nutrientId === 1005)?.value || 0,
      fat: food.foodNutrients?.find((n: any) => n.nutrientId === 1004)?.value || 0,
      fiber: food.foodNutrients?.find((n: any) => n.nutrientId === 1079)?.value || 0,
      sugar: food.foodNutrients?.find((n: any) => n.nutrientId === 2000)?.value || 0,
      sodium: food.foodNutrients?.find((n: any) => n.nutrientId === 1093)?.value || 0,
      category: food.foodCategory || 'Outros',
      brand: food.brandOwner || null,
      ingredients: food.ingredients ? [food.ingredients] : [],
      allergens: []
    })) || [];

    return new Response(
      JSON.stringify({ foods }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na API USDA:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao buscar alimentos na API USDA', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
