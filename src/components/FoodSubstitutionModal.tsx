import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from 'lucide-react';
import { foodDataService, FoodItem } from '@/services/foodDataService';
import { useToast } from "@/hooks/use-toast";
import { AIFoodImage } from './AIFoodImage';

interface FoodSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFood: FoodItem;
  onSubstitute: (newFood: FoodItem) => void;
  restrictions: string[];
}

export const FoodSubstitutionModal: React.FC<FoodSubstitutionModalProps> = ({
  isOpen,
  onClose,
  currentFood,
  onSubstitute,
  restrictions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  const categories = [
    'Cereais', 'Leguminosas', 'Frutas', 'Carnes', 
    'Hortaliças', 'Tubérculos', 'Laticínios', 'Ovos', 'Nozes'
  ];

  useEffect(() => {
    if (isOpen) {
      // Buscar alimentos similares automaticamente
      searchSimilarFoods();
    }
  }, [isOpen, currentFood]);

  const searchSimilarFoods = async () => {
    setIsSearching(true);
    try {
      // Buscar por categoria primeiro
      let results = await foodDataService.searchFoods(currentFood.category || 'alimento', 10);
      
      // Se não encontrou por categoria, buscar por nome
      if (results.length === 0) {
        const searchTerm = currentFood.name.split(',')[0].toLowerCase();
        results = await foodDataService.searchFoods(searchTerm, 10);
      }

      // Filtrar para remover o alimento atual e aplicar restrições
      const filteredResults = results
        .filter(food => food.id !== currentFood.id)
        .filter(food => !restrictions.some(restriction =>
          food.name.toLowerCase().includes(restriction.toLowerCase())
        ));

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Erro ao buscar alimentos similares:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar alimentos similares.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let results = await foodDataService.searchFoods(searchQuery, 20);

      // Aplicar filtro de categoria se selecionado
      if (selectedCategory) {
        results = results.filter(food => 
          food.category?.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }

      // Filtrar restrições
      const filteredResults = results.filter(food => 
        !restrictions.some(restriction =>
          food.name.toLowerCase().includes(restriction.toLowerCase())
        )
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSubstitute = (newFood: FoodItem) => {
    onSubstitute(newFood);
    onClose();
    toast({
      title: "Alimento substituído",
      description: `${currentFood.name} foi substituído por ${newFood.name}`,
    });
  };

  const formatNutrition = (value: number) => {
    return Math.round(value * 10) / 10;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Substituir: {currentFood.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Alimento Atual */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Alimento Atual:</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AIFoodImage
                  foodName={currentFood.name}
                  category={currentFood.category}
                  fallbackImage={currentFood.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=48&h=48&fit=crop&crop=center'}
                  alt={currentFood.name}
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <p className="font-medium">{currentFood.name}</p>
                  <p className="text-sm text-gray-600">{currentFood.category} • TBCA-USP</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{formatNutrition(currentFood.calories)} kcal</Badge>
                <Badge variant="secondary">P: {formatNutrition(currentFood.protein)}g</Badge>
                <Badge variant="secondary">C: {formatNutrition(currentFood.carbs)}g</Badge>
                <Badge variant="secondary">G: {formatNutrition(currentFood.fat)}g</Badge>
              </div>
            </div>
          </div>

          {/* Busca */}
          <div className="space-y-4 mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar alimentos na base TBCA-USP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {/* Filtros por Categoria */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === '' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Todas
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Resultados */}
          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Buscando alimentos...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((food) => (
                  <div
                    key={food.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSubstitute(food)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <AIFoodImage
                          foodName={food.name}
                          category={food.category}
                          fallbackImage={food.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=48&h=48&fit=crop&crop=center'}
                          alt={food.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{food.name}</h4>
                          <p className="text-sm text-gray-600">
                            {food.category} • TBCA-USP • Por 100g
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {formatNutrition(food.calories)} kcal
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          P: {formatNutrition(food.protein)}g
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          C: {formatNutrition(food.carbs)}g
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          G: {formatNutrition(food.fat)}g
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchQuery ? 'Nenhum alimento encontrado. Tente outros termos de busca.' : 'Digite um termo para buscar alimentos na base TBCA-USP.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSubstitutionModal;
