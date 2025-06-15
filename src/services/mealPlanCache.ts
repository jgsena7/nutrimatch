
interface CachedMealPlan {
  id: string;
  userId: string;
  userProfileHash: string;
  mealPlan: any;
  timestamp: number;
  expiresIn: number; // em horas
}

class MealPlanCacheService {
  private readonly CACHE_KEY = 'nutritional_meal_plans';
  private readonly DEFAULT_EXPIRY = 24; // 24 horas

  // Gerar hash do perfil do usuário para invalidar cache quando mudar
  private generateProfileHash(userProfile: any): string {
    const profileString = JSON.stringify({
      age: userProfile.age,
      height: userProfile.height,
      weight: userProfile.weight,
      gender: userProfile.gender,
      activity_level: userProfile.activity_level,
      goal: userProfile.goal,
      food_restrictions: userProfile.food_restrictions
    });
    
    // Hash simples baseado no conteúdo
    let hash = 0;
    for (let i = 0; i < profileString.length; i++) {
      const char = profileString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit integer
    }
    return hash.toString();
  }

  // Salvar plano no cache
  saveMealPlan(userId: string, userProfile: any, mealPlan: any): void {
    try {
      const profileHash = this.generateProfileHash(userProfile);
      const cachedPlan: CachedMealPlan = {
        id: `${userId}_${Date.now()}`,
        userId,
        userProfileHash: profileHash,
        mealPlan,
        timestamp: Date.now(),
        expiresIn: this.DEFAULT_EXPIRY
      };

      // Obter cache existente
      const existingCache = this.getCache();
      
      // Limpar planos antigos do mesmo usuário
      const filteredCache = existingCache.filter(plan => plan.userId !== userId);
      
      // Adicionar novo plano
      filteredCache.push(cachedPlan);
      
      // Salvar no localStorage
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(filteredCache));
      
      console.log('Plano alimentar salvo no cache');
    } catch (error) {
      console.error('Erro ao salvar plano no cache:', error);
    }
  }

  // Recuperar plano do cache
  getMealPlan(userId: string, userProfile: any): any | null {
    try {
      const profileHash = this.generateProfileHash(userProfile);
      const cache = this.getCache();
      
      // Buscar plano do usuário com hash correspondente
      const cachedPlan = cache.find(plan => 
        plan.userId === userId && 
        plan.userProfileHash === profileHash &&
        this.isValidCache(plan)
      );

      if (cachedPlan) {
        console.log('Plano alimentar recuperado do cache');
        return cachedPlan.mealPlan;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao recuperar plano do cache:', error);
      return null;
    }
  }

  // Verificar se o cache ainda é válido
  private isValidCache(cachedPlan: CachedMealPlan): boolean {
    const now = Date.now();
    const expiryTime = cachedPlan.timestamp + (cachedPlan.expiresIn * 60 * 60 * 1000);
    return now < expiryTime;
  }

  // Obter cache completo
  private getCache(): CachedMealPlan[] {
    try {
      const cacheString = localStorage.getItem(this.CACHE_KEY);
      if (!cacheString) return [];
      
      const cache = JSON.parse(cacheString);
      
      // Filtrar apenas caches válidos
      return cache.filter((plan: CachedMealPlan) => this.isValidCache(plan));
    } catch (error) {
      console.error('Erro ao ler cache:', error);
      return [];
    }
  }

  // Limpar cache expirado
  clearExpiredCache(): void {
    try {
      const validCache = this.getCache();
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(validCache));
      console.log('Cache expirado removido');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  // Limpar todo o cache do usuário
  clearUserCache(userId: string): void {
    try {
      const cache = this.getCache();
      const filteredCache = cache.filter(plan => plan.userId !== userId);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(filteredCache));
      console.log('Cache do usuário limpo');
    } catch (error) {
      console.error('Erro ao limpar cache do usuário:', error);
    }
  }
}

export const mealPlanCache = new MealPlanCacheService();
