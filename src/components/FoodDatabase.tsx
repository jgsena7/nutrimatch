
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
          Busque informações nutricionais completas de milhares de alimentos. 
          Nossa base integra dados de fontes confiáveis como USDA e Open Food Facts.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((food, index) => (
                <Dialog key={index} open={isDialogOpen && selectedFood?.id === food.id} onOpenChange={(open) => {
                  if (!open) {
                    setIsDialogOpen(false);
                    setSelectedFood(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow hover:bg-nutri-green-50"
                      onClick={() => openFoodDetails(food)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-nutri-dark-900 mb-2 line-clamp-2">
                          {food.name}
                        </h4>
                        <div className="space-y-1 text-sm text-nutri-dark-600">
                          <p><strong>Calorias:</strong> {food.calories} kcal/100g</p>
                          <p><strong>Proteínas:</strong> {food.protein}g</p>
                          <p><strong>Carboidratos:</strong> {food.carbs}g</p>
                          <p><strong>Gorduras:</strong> {food.fat}g</p>
                          {food.brand && (
                            <p><strong>Marca:</strong> {food.brand}</p>
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
                        <div>
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
