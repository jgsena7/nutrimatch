
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
    
    // A TBCA (USP) não tem uma API pública oficial, então vamos simular com dados brasileiros típicos
    // Em uma implementação real, você precisaria de acesso à base de dados da TBCA
    const tbcaFoods = [
      {
        id: 'tbca_1',
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
        id: 'tbca_2',
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
        id: 'tbca_3',
        name: 'Banana, nanica, crua',
        calories: 92,
        protein: 1.3,
        carbs: 23.8,
        fat: 0.1,
        fiber: 2.6,
        sugar: 16.0,
        category: 'Frutas',
        source: 'TBCA'
      },
      {
        id: 'tbca_4',
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
        id: 'tbca_5',
        name: 'Mandioca, crua',
        calories: 125,
        protein: 0.6,
        carbs: 30.1,
        fat: 0.3,
        fiber: 1.6,
        category: 'Tubérculos',
        source: 'TBCA'
      },
      {
        id: 'tbca_6',
        name: 'Açaí, polpa, congelada',
        calories: 58,
        protein: 0.8,
        carbs: 6.2,
        fat: 3.9,
        fiber: 2.6,
        category: 'Frutas',
        source: 'TBCA'
      },
      {
        id: 'tbca_7',
        name: 'Pão francês',
        calories: 300,
        protein: 8.0,
        carbs: 58.6,
        fat: 3.1,
        fiber: 2.3,
        category: 'Panificados',
        source: 'TBCA'
      },
      {
        id: 'tbca_8',
        name: 'Leite, vaca, integral',
        calories: 61,
        protein: 2.9,
        carbs: 4.3,
        fat: 3.2,
        fiber: 0.0,
        category: 'Laticínios',
        source: 'TBCA'
      },
      {
        id: 'tbca_9',
        name: 'Ovo, galinha, inteiro, cru',
        calories: 143,
        protein: 13.0,
        carbs: 1.6,
        fat: 8.9,
        fiber: 0.0,
        category: 'Ovos',
        source: 'TBCA'
      },
      {
        id: 'tbca_10',
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
        id: 'tbca_11',
        name: 'Tomate, cru',
        calories: 15,
        protein: 1.1,
        carbs: 3.1,
        fat: 0.2,
        fiber: 1.2,
        category: 'Hortaliças',
        source: 'TBCA'
      },
      {
        id: 'tbca_12',
        name: 'Alface, crespa, crua',
        calories: 8,
        protein: 1.0,
        carbs: 1.4,
        fat: 0.2,
        fiber: 1.7,
        category: 'Hortaliças',
        source: 'TBCA'
      }
    ];

    // Filtrar alimentos baseado na query
    const filteredFoods = tbcaFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, maxResults);

    const foods = filteredFoods.map(food => ({
      id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: 0, // TBCA não tem dados de sódio para todos os alimentos
      category: food.category,
      brand: null,
      ingredients: [],
      allergens: [],
      source: 'TBCA (USP)'
    }));

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
    console.error('Erro na API TBCA:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao buscar alimentos na TBCA', 
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
