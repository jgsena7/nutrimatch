
import { supabase } from "@/integrations/supabase/client";
import { imageCacheService } from "./imageCache";

interface GenerateImageResponse {
  imageUrl: string;
  foodName: string;
  category?: string;
  prompt: string;
}

class AIImageService {
  private pendingRequests = new Map<string, Promise<string>>();

  async generateFoodImage(foodName: string, category?: string): Promise<string> {
    const cacheKey = foodName.toLowerCase().trim();

    // 1. Verificar cache primeiro
    const cachedImage = imageCacheService.getCachedImage(foodName);
    if (cachedImage) {
      return cachedImage;
    }

    // 2. Verificar se já existe uma requisição pendente para este alimento
    if (this.pendingRequests.has(cacheKey)) {
      try {
        return await this.pendingRequests.get(cacheKey)!;
      } catch (error) {
        this.pendingRequests.delete(cacheKey);
        throw error;
      }
    }

    // 3. Criar nova requisição
    const imagePromise = this.requestImageGeneration(foodName, category);
    this.pendingRequests.set(cacheKey, imagePromise);

    try {
      const imageUrl = await imagePromise;
      this.pendingRequests.delete(cacheKey);
      return imageUrl;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  private async requestImageGeneration(foodName: string, category?: string): Promise<string> {
    try {
      console.log(`Gerando imagem para: ${foodName}, categoria: ${category}`);

      const { data, error } = await supabase.functions.invoke('generate-food-image', {
        body: { foodName, category }
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(`Erro ao gerar imagem: ${error.message}`);
      }

      if (!data || !data.imageUrl) {
        throw new Error('Resposta inválida da API de geração de imagens');
      }

      const response = data as GenerateImageResponse;
      
      // Salvar no cache
      imageCacheService.setCachedImage(foodName, response.imageUrl, category);
      
      console.log(`Imagem gerada e cacheada para: ${foodName}`);
      return response.imageUrl;

    } catch (error) {
      console.error(`Erro ao gerar imagem para ${foodName}:`, error);
      throw error;
    }
  }

  // Método para gerar imagens em background para múltiplos alimentos
  async generateImagesInBackground(foods: Array<{ name: string; category?: string }>): Promise<void> {
    const promises = foods.map(food => 
      this.generateFoodImage(food.name, food.category).catch(error => {
        console.warn(`Falha ao gerar imagem para ${food.name}:`, error);
        return null;
      })
    );

    // Executar todas as gerações em paralelo sem aguardar
    Promise.all(promises).then(results => {
      const successful = results.filter(result => result !== null).length;
      console.log(`Background: ${successful}/${foods.length} imagens geradas com sucesso`);
    });
  }

  // Obter estatísticas do cache
  getCacheStats() {
    return imageCacheService.getCacheStats();
  }

  // Limpar cache expirado
  clearExpiredCache() {
    imageCacheService.clearExpiredCache();
  }
}

export const aiImageService = new AIImageService();
