
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, page = 1 } = await req.json();
    const apiKey = Deno.env.get('USDA_API_KEY');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'USDA API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Query deve ter pelo menos 2 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Searching USDA Food Data Central for: ${query}`);

    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=20&pageNumber=${page}&dataType=Foundation,SR%20Legacy`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data = await response.json();

    const products = data.foods?.map((food: any) => ({
      id: food.fdcId.toString(),
      name: food.description || 'Nome não disponível',
      brand: food.brandOwner || '',
      image: '',
      source: 'usda',
      nutrition: {
        energy_kcal: food.foodNutrients?.find((n: any) => n.nutrientId === 1008)?.value || 0,
        proteins: food.foodNutrients?.find((n: any) => n.nutrientId === 1003)?.value || 0,
        carbohydrates: food.foodNutrients?.find((n: any) => n.nutrientId === 1005)?.value || 0,
        fat: food.foodNutrients?.find((n: any) => n.nutrientId === 1004)?.value || 0,
        fiber: food.foodNutrients?.find((n: any) => n.nutrientId === 1079)?.value || 0,
        sodium: food.foodNutrients?.find((n: any) => n.nutrientId === 1093)?.value || 0,
        sugars: food.foodNutrients?.find((n: any) => n.nutrientId === 2000)?.value || 0
      },
      categories: food.foodCategory || ''
    })) || [];

    return new Response(JSON.stringify({ 
      products,
      total: data.totalHits || 0,
      page: page
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error searching USDA:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar alimentos' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
