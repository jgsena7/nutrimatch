
interface CachedImage {
  url: string;
  timestamp: number;
  foodName: string;
  category?: string;
}

class ImageCacheService {
  private cacheKey = 'nutrimatch_food_images';
  private cacheDuration = 30 * 24 * 60 * 60 * 1000; // 30 dias em ms

  private getCache(): { [key: string]: CachedImage } {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('Erro ao ler cache de imagens:', error);
      return {};
    }
  }

  private saveCache(cache: { [key: string]: CachedImage }): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Erro ao salvar cache de imagens:', error);
    }
  }

  private generateCacheKey(foodName: string): string {
    return foodName.toLowerCase().trim().replace(/\s+/g, '_');
  }

  getCachedImage(foodName: string): string | null {
    const cache = this.getCache();
    const key = this.generateCacheKey(foodName);
    const cached = cache[key];

    if (!cached) return null;

    // Verificar se o cache expirou
    const now = Date.now();
    if (now - cached.timestamp > this.cacheDuration) {
      this.removeCachedImage(foodName);
      return null;
    }

    return cached.url;
  }

  setCachedImage(foodName: string, imageUrl: string, category?: string): void {
    const cache = this.getCache();
    const key = this.generateCacheKey(foodName);

    cache[key] = {
      url: imageUrl,
      timestamp: Date.now(),
      foodName,
      category
    };

    this.saveCache(cache);
  }

  removeCachedImage(foodName: string): void {
    const cache = this.getCache();
    const key = this.generateCacheKey(foodName);
    delete cache[key];
    this.saveCache(cache);
  }

  clearExpiredCache(): void {
    const cache = this.getCache();
    const now = Date.now();
    let hasChanges = false;

    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > this.cacheDuration) {
        delete cache[key];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveCache(cache);
    }
  }

  getCacheStats(): { total: number; size: string } {
    const cache = this.getCache();
    const total = Object.keys(cache).length;
    const size = new Blob([JSON.stringify(cache)]).size;
    const sizeFormatted = size > 1024 * 1024 
      ? `${(size / (1024 * 1024)).toFixed(2)} MB`
      : `${(size / 1024).toFixed(2)} KB`;
    
    return { total, size: sizeFormatted };
  }
}

export const imageCacheService = new ImageCacheService();
