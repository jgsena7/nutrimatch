
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { foodName, category } = await req.json();

    if (!foodName) {
      return new Response(
        JSON.stringify({ error: 'Nome do alimento é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar prompt otimizado baseado na categoria
    const prompt = generateOptimizedPrompt(foodName, category);
    
    console.log(`Gerando imagem para: ${foodName} com prompt: ${prompt}`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        style: 'natural',
        output_format: 'webp'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro da OpenAI:', error);
      throw new Error(`Erro da OpenAI: ${response.status}`);
    }

    const data = await response.json();
    
    // gpt-image-1 retorna base64, vamos converter para URL utilizável
    const base64Image = data.data[0].b64_json;
    const imageUrl = `data:image/webp;base64,${base64Image}`;

    console.log(`Imagem gerada com sucesso para: ${foodName}`);

    return new Response(
      JSON.stringify({ 
        imageUrl,
        foodName,
        category,
        prompt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na geração de imagem:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao gerar imagem', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateOptimizedPrompt(foodName: string, category?: string): string {
  const cleanName = foodName.toLowerCase().trim();
  
  // Prompts específicos por categoria para melhor qualidade
  const categoryPrompts: { [key: string]: string } = {
    'frutas': `Fotografia profissional de ${cleanName} brasileira fresca, fruta inteira, cores vibrantes naturais, fundo branco limpo, iluminação natural suave, alta resolução, estilo gastronômico minimalista`,
    'carnes': `Fotografia gastronômica de ${cleanName} crua, corte brasileiro premium, textura visível, fundo neutro, iluminação profissional, estilo culinário elegante`,
    'cereais': `Foto close-up de ${cleanName} em grão, textura detalhada visível, grãos soltos, fundo branco clean, iluminação natural, estilo alimentar profissional`,
    'hortaliças': `Fotografia de ${cleanName} fresco brasileiro, vegetal inteiro, cores naturais vibrantes, fundo minimalista branco, iluminação suave, estilo orgânico premium`,
    'leguminosas': `Foto profissional de ${cleanName} em grão, textura natural, grãos espalhados, fundo neutro limpo, iluminação difusa, estilo culinário`,
    'laticínios': `Fotografia gastronômica de ${cleanName}, produto lácteo brasileiro, apresentação elegante, fundo clean, iluminação suave, estilo premium`,
    'tubérculos': `Foto de ${cleanName} fresco brasileiro, tubérculo inteiro, textura natural da casca, fundo branco, iluminação natural, estilo orgânico`,
    'panificados': `Fotografia profissional de ${cleanName} artesanal brasileiro, textura visível, crosta dourada, fundo neutro, iluminação quente, estilo padaria gourmet`
  };

  // Verificar se a categoria corresponde a alguma das especializadas
  const categoryKey = Object.keys(categoryPrompts).find(key => 
    category?.toLowerCase().includes(key) || cleanName.includes(key)
  );

  if (categoryKey && categoryPrompts[categoryKey]) {
    return categoryPrompts[categoryKey];
  }

  // Prompt genérico de alta qualidade para alimentos não categorizados
  return `Fotografia profissional de ${cleanName} brasileiro, alimento fresco, apresentação natural elegante, fundo branco limpo, iluminação natural suave, alta resolução, estilo gastronômico minimalista, cores vibrantes naturais`;
}
