
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
    
    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Query deve ter pelo menos 2 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Searching Open Food Facts for: ${query}`);

    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=20&fields=code,product_name,brands,image_url,nutriments,categories`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'NutriMatch-App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }

    const data = await response.json();

    const products = data.products?.map((product: any) => ({
      id: product.code,
      name: product.product_name || 'Nome não disponível',
      brand: product.brands || '',
      image: product.image_url || '',
      source: 'openfoodfacts',
      nutrition: {
        energy_kcal: product.nutriments?.['energy-kcal_100g'] || 0,
        proteins: product.nutriments?.['proteins_100g'] || 0,
        carbohydrates: product.nutriments?.['carbohydrates_100g'] || 0,
        fat: product.nutriments?.['fat_100g'] || 0,
        fiber: product.nutriments?.['fiber_100g'] || 0,
        sodium: product.nutriments?.['sodium_100g'] || 0,
        sugars: product.nutriments?.['sugars_100g'] || 0
      },
      categories: product.categories || ''
    })) || [];

    return new Response(JSON.stringify({ 
      products,
      total: data.count || 0,
      page: data.page || 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error searching Open Food Facts:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar alimentos' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
