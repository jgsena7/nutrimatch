
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FoodItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  source: string;
  nutrition: {
    energy_kcal: number;
    proteins: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sodium: number;
    sugars: number;
  };
  categories: string;
}

interface FoodSearchProps {
  onAddFood?: (food: FoodItem) => void;
}

const FoodSearch = ({ onAddFood }: FoodSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<'both' | 'openfoodfacts' | 'usda'>('both');
  const { toast } = useToast();

  const searchFood = async () => {
    if (!query.trim() || query.length < 2) {
      toast({
        title: "Query muito curta",
        description: "Digite pelo menos 2 caracteres para buscar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const searches = [];

      if (activeSource === 'both' || activeSource === 'openfoodfacts') {
        searches.push(
          supabase.functions.invoke('search-food-openfoodfacts', {
            body: { query, page: 1 }
          })
        );
      }

      if (activeSource === 'both' || activeSource === 'usda') {
        searches.push(
          supabase.functions.invoke('search-food-usda', {
            body: { query, page: 1 }
          })
        );
      }

      const responses = await Promise.allSettled(searches);
      let allProducts: FoodItem[] = [];

      responses.forEach((response) => {
        if (response.status === 'fulfilled' && response.value.data) {
          allProducts = [...allProducts, ...(response.value.data.products || [])];
        }
      });

      // Remove duplicatas baseado no nome
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.name.toLowerCase() === product.name.toLowerCase())
      );

      setResults(uniqueProducts);

      if (uniqueProducts.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: "Tente termos de busca diferentes",
        });
      }

    } catch (error) {
      console.error('Error searching food:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar alimentos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchFood();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Alimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome do alimento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchFood} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeSource === 'both' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSource('both')}
            >
              Todas as fontes
            </Button>
            <Button
              variant={activeSource === 'openfoodfacts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSource('openfoodfacts')}
            >
              Open Food Facts
            </Button>
            <Button
              variant={activeSource === 'usda' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSource('usda')}
            >
              USDA
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((food) => (
            <Card key={`${food.source}-${food.id}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {food.image && (
                      <img 
                        src={food.image} 
                        alt={food.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{food.name}</h3>
                      {food.brand && (
                        <p className="text-sm text-gray-600 mb-2">{food.brand}</p>
                      )}
                      
                      <div className="flex gap-2 mb-2">
                        <Badge variant={food.source === 'openfoodfacts' ? 'default' : 'secondary'}>
                          {food.source === 'openfoodfacts' ? 'Open Food Facts' : 'USDA'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Calorias:</span> {Math.round(food.nutrition.energy_kcal)} kcal
                        </div>
                        <div>
                          <span className="font-medium">Proteínas:</span> {food.nutrition.proteins.toFixed(1)}g
                        </div>
                        <div>
                          <span className="font-medium">Carboidratos:</span> {food.nutrition.carbohydrates.toFixed(1)}g
                        </div>
                        <div>
                          <span className="font-medium">Gorduras:</span> {food.nutrition.fat.toFixed(1)}g
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {onAddFood && (
                    <Button
                      onClick={() => onAddFood(food)}
                      size="sm"
                      className="ml-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
