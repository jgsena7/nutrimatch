
import React, { useState } from 'react';
import { Search, Database, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { foodDataService, FoodItem } from '@/services/foodDataService';
import { useToast } from "@/hooks/use-toast";

const FoodDatabase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome de um alimento para buscar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await foodDataService.searchFoods(searchQuery, 20);
      setSearchResults(results);
      if (results.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: "Não encontramos alimentos com esse nome. Tente uma busca diferente.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar alimentos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openFoodDetails = (food: FoodItem) => {
    setSelectedFood(food);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Database className="w-16 h-16 mx-auto mb-4 text-nutri-green-500" />
        <h3 className="text-2xl font-semibold mb-4 text-nutri-dark-900">Base de Dados de Alimentos</h3>
        <p className="text-nutri-dark-600 mb-6 max-w-2xl mx-auto">
          Busque informações nutricionais completas de milhares de alimentos integrados de fontes confiáveis.
        </p>
      </div>

      {/* Barra de Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o nome do alimento (ex: banana, arroz integral, leite)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-nutri-green-500 hover:bg-nutri-green-600 px-8"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Busca */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-nutri-dark-900">
              Resultados da Busca ({searchResults.length} encontrados)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((food, index) => (
                <Dialog key={index} open={isDialogOpen && selectedFood?.id === food.id} onOpenChange={(open) => {
                  if (!open) {
                    setIsDialogOpen(false);
                    setSelectedFood(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all hover:bg-nutri-green-50 overflow-hidden"
                      onClick={() => openFoodDetails(food)}
                    >
                      <div className="aspect-square relative bg-gray-100">
                        {food.image ? (
                          <img 
                            src={food.image} 
                            alt={food.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop&crop=center';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-nutri-green-100">
                            <Database className="w-12 h-12 text-nutri-green-500" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-nutri-dark-900 mb-2 line-clamp-2 text-sm">
                          {food.name}
                        </h4>
                        <div className="space-y-1 text-xs text-nutri-dark-600">
                          <p><strong>{food.calories}</strong> kcal/100g</p>
                          <div className="flex justify-between">
                            <span>Prot: {food.protein}g</span>
                            <span>Carb: {food.carbs}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Gord: {food.fat}g</span>
                            {food.fiber && <span>Fibra: {food.fiber}g</span>}
                          </div>
                          {food.brand && (
                            <p className="text-xs text-nutri-green-600 truncate"><strong>{food.brand}</strong></p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-nutri-dark-900">
                        Informações Nutricionais Detalhadas
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedFood && (
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {selectedFood.image ? (
                              <img 
                                src={selectedFood.image} 
                                alt={selectedFood.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=96&h=96&fit=crop&crop=center';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Database className="w-8 h-8 text-nutri-green-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-nutri-dark-900 mb-2">
                              {selectedFood.name}
                            </h3>
                            {selectedFood.brand && (
                              <p className="text-nutri-dark-600"><strong>Marca:</strong> {selectedFood.brand}</p>
                            )}
                            {selectedFood.category && (
                              <p className="text-nutri-dark-600"><strong>Categoria:</strong> {selectedFood.category}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-nutri-dark-700">Macronutrientes (por 100g)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>Calorias:</span>
                                <span className="font-semibold">{selectedFood.calories} kcal</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Proteínas:</span>
                                <span className="font-semibold">{selectedFood.protein}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Carboidratos:</span>
                                <span className="font-semibold">{selectedFood.carbs}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Gorduras:</span>
                                <span className="font-semibold">{selectedFood.fat}g</span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-nutri-dark-700">Outros Nutrientes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {selectedFood.fiber && (
                                <div className="flex justify-between">
                                  <span>Fibras:</span>
                                  <span className="font-semibold">{selectedFood.fiber}g</span>
                                </div>
                              )}
                              {selectedFood.sugar && (
                                <div className="flex justify-between">
                                  <span>Açúcares:</span>
                                  <span className="font-semibold">{selectedFood.sugar}g</span>
                                </div>
                              )}
                              {selectedFood.sodium && (
                                <div className="flex justify-between">
                                  <span>Sódio:</span>
                                  <span className="font-semibold">{selectedFood.sodium}mg</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {selectedFood.allergens && selectedFood.allergens.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-nutri-dark-700">Alergênicos</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {selectedFood.allergens.map((allergen, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                                  >
                                    {allergen}
                                  </span>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {selectedFood.ingredients && selectedFood.ingredients.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-nutri-dark-700">Ingredientes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-nutri-dark-600">
                                {selectedFood.ingredients.join(', ')}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FoodDatabase;
