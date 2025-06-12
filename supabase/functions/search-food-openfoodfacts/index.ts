
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
    
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${maxResults}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    const foods = data.products?.map((product: any) => ({
      id: product.code || crypto.randomUUID(),
      name: product.product_name || 'Produto sem nome',
      calories: product.nutriments?.['energy-kcal_100g'] || 0,
      protein: product.nutriments?.['proteins_100g'] || 0,
      carbs: product.nutriments?.['carbohydrates_100g'] || 0,
      fat: product.nutriments?.['fat_100g'] || 0,
      fiber: product.nutriments?.['fiber_100g'] || 0,
      sugar: product.nutriments?.['sugars_100g'] || 0,
      sodium: product.nutriments?.['sodium_100g'] || 0,
      category: product.categories_tags?.[0] || 'Outros',
      brand: product.brands || null,
      ingredients: product.ingredients_text ? [product.ingredients_text] : [],
      allergens: product.allergens_tags || [],
      image: product.image_url || null
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
    console.error('Erro na API Open Food Facts:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao buscar alimentos na API Open Food Facts', 
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
