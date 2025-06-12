
import React, { useState } from 'react';
import FoodSearch from '@/components/FoodSearch';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Database } from 'lucide-react';
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

const FoodDatabasePage = () => {
  const [savedFoods, setSavedFoods] = useState<FoodItem[]>([]);
  const { toast } = useToast();

  const handleAddFood = (food: FoodItem) => {
    // Verificar se o alimento já foi adicionado
    const exists = savedFoods.find(f => f.id === food.id && f.source === food.source);
    
    if (exists) {
      toast({
        title: "Alimento já adicionado",
        description: "Este alimento já está na sua lista",
        variant: "destructive"
      });
      return;
    }

    setSavedFoods(prev => [...prev, food]);
    toast({
      title: "Alimento adicionado!",
      description: `${food.name} foi adicionado à sua lista`,
    });
  };

  const handleRemoveFood = (foodId: string, source: string) => {
    setSavedFoods(prev => prev.filter(f => !(f.id === foodId && f.source === source)));
    toast({
      title: "Alimento removido",
      description: "O alimento foi removido da sua lista",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutri-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-nutri-green-400">Base de Dados</span> <span className="text-nutri-dark-900">de Alimentos</span>
          </h1>
          <p className="text-nutri-dark-600">
            Busque alimentos em bases de dados internacionais e monte sua lista personalizada
          </p>
          <div className="w-32 h-1 bg-nutri-green-500 mx-auto rounded-full mt-4"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <FoodSearch onAddFood={handleAddFood} />
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Minha Lista de Alimentos ({savedFoods.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedFoods.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum alimento salvo ainda.</p>
                    <p className="text-sm">Use a busca ao lado para adicionar alimentos.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {savedFoods.map((food) => (
                      <div key={`${food.source}-${food.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{food.name}</h4>
                          {food.brand && (
                            <p className="text-sm text-gray-600">{food.brand}</p>
                          )}
                          <div className="flex gap-2 mt-1">
                            <Badge variant={food.source === 'openfoodfacts' ? 'default' : 'secondary'} className="text-xs">
                              {food.source === 'openfoodfacts' ? 'OFF' : 'USDA'}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {Math.round(food.nutrition.energy_kcal)} kcal
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFood(food.id, food.source)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {savedFoods.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Resumo Nutricional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total de Calorias:</span>
                      <p className="text-lg font-bold text-nutri-green-600">
                        {Math.round(savedFoods.reduce((sum, food) => sum + food.nutrition.energy_kcal, 0))} kcal
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Total de Proteínas:</span>
                      <p className="text-lg font-bold text-nutri-green-600">
                        {savedFoods.reduce((sum, food) => sum + food.nutrition.proteins, 0).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Total de Carboidratos:</span>
                      <p className="text-lg font-bold text-nutri-green-600">
                        {savedFoods.reduce((sum, food) => sum + food.nutrition.carbohydrates, 0).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Total de Gorduras:</span>
                      <p className="text-lg font-bold text-nutri-green-600">
                        {savedFoods.reduce((sum, food) => sum + food.nutrition.fat, 0).toFixed(1)}g
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDatabasePage;
