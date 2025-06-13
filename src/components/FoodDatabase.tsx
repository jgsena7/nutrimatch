
import React, { useState } from 'react';
import { Search, Database, Loader2, MapPin, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
          description: "Não encontramos alimentos com informações completas para essa busca. Tente termos diferentes.",
        });
      } else {
        toast({
          title: "Busca realizada",
          description: `Encontrados ${results.length} alimentos com dados verificados de TBCA (USP) e Open Food Facts.`,
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

  const getSourceBadge = (source: string) => {
    if (source === 'TBCA (USP)') {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <MapPin className="w-3 h-3 mr-1" />
          TBCA (USP)
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Database className="w-3 h-3 mr-1" />
        Open Food Facts
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />);
    }
    
    return <div className="flex">{stars}</div>;
  };

  const formatNutritionalValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return value.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Database className="w-16 h-16 mx-auto mb-4 text-nutri-green-500" />
        <h3 className="text-2xl font-semibold mb-4 text-nutri-dark-900">Base de Dados de Alimentos</h3>
        <p className="text-nutri-dark-600 mb-6 max-w-2xl mx-auto">
          Busque informações nutricionais completas e verificadas de alimentos brasileiros (TBCA-USP) e internacionais (Open Food Facts).
        </p>
      </div>

      {/* Barra de Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o nome do alimento (ex: arroz, feijão, banana, frango)"
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
              Resultados Verificados ({searchResults.length} encontrados)
            </CardTitle>
            <p className="text-sm text-nutri-dark-600">
              Mostrando apenas alimentos com dados nutricionais completos e verificados. Ordenados por qualidade da informação.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((food, index) => (
                <Dialog key={`${food.id}-${index}`} open={isDialogOpen && selectedFood?.id === food.id} onOpenChange={(open) => {
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
                        <img 
                          src={food.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop&crop=center'} 
                          alt={food.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop&crop=center';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          {getSourceBadge(food.source || 'Open Food Facts')}
                        </div>
                        {food.rating && (
                          <div className="absolute top-2 left-2 bg-white/90 rounded px-2 py-1">
                            {getRatingStars(food.rating)}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-nutri-dark-900 mb-2 line-clamp-2 text-sm">
                          {food.name}
                        </h4>
                        <div className="space-y-1 text-xs text-nutri-dark-600">
                          <p><strong>{formatNutritionalValue(food.calories)}</strong> kcal/100g</p>
                          <div className="flex justify-between">
                            <span>Proteínas: {formatNutritionalValue(food.protein)}g</span>
                            <span>Carboidratos: {formatNutritionalValue(food.carbs)}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Gorduras: {formatNutritionalValue(food.fat)}g</span>
                            {food.fiber && <span>Fibras: {formatNutritionalValue(food.fiber)}g</span>}
                          </div>
                          {food.brand && (
                            <p className="text-xs text-nutri-green-600 truncate"><strong>{food.brand}</strong></p>
                          )}
                          {food.category && (
                            <p className="text-xs text-gray-500">{food.category}</p>
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
                            <img 
                              src={selectedFood.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=96&h=96&fit=crop&crop=center'} 
                              alt={selectedFood.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=96&h=96&fit=crop&crop=center';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-nutri-dark-900 mb-2">
                              {selectedFood.name}
                            </h3>
                            <div className="flex gap-2 mb-2">
                              {getSourceBadge(selectedFood.source || 'Open Food Facts')}
                              {selectedFood.rating && (
                                <div className="flex items-center gap-1">
                                  {getRatingStars(selectedFood.rating)}
                                  <span className="text-xs text-gray-600">({selectedFood.rating.toFixed(1)})</span>
                                </div>
                              )}
                            </div>
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
                                <span className="font-semibold">{formatNutritionalValue(selectedFood.calories)} kcal</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Proteínas:</span>
                                <span className="font-semibold">{formatNutritionalValue(selectedFood.protein)}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Carboidratos:</span>
                                <span className="font-semibold">{formatNutritionalValue(selectedFood.carbs)}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Gorduras:</span>
                                <span className="font-semibold">{formatNutritionalValue(selectedFood.fat)}g</span>
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
                                  <span className="font-semibold">{formatNutritionalValue(selectedFood.fiber)}g</span>
                                </div>
                              )}
                              {selectedFood.sugar && (
                                <div className="flex justify-between">
                                  <span>Açúcares:</span>
                                  <span className="font-semibold">{formatNutritionalValue(selectedFood.sugar)}g</span>
                                </div>
                              )}
                              {selectedFood.sodium && (
                                <div className="flex justify-between">
                                  <span>Sódio:</span>
                                  <span className="font-semibold">{Math.round(selectedFood.sodium)}mg</span>
                                </div>
                              )}
                              {(!selectedFood.fiber && !selectedFood.sugar && !selectedFood.sodium) && (
                                <p className="text-sm text-gray-500">Dados adicionais não disponíveis</p>
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
                              <CardTitle className="text-sm text-nutri-dark-700">Lista de Ingredientes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-nutri-dark-600">
                                {selectedFood.ingredients.join(', ')}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {selectedFood.source === 'TBCA (USP)' && (
                          <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-green-700">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Dados Verificados da Tabela Brasileira de Composição de Alimentos (TBCA-USP)
                                </span>
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                Fonte oficial brasileira para dados nutricionais - Máxima confiabilidade.
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
