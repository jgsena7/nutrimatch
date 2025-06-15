import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, RefreshCw, MessageSquare, Clock, Utensils } from 'lucide-react';
import { Meal } from '@/services/mealPlanGenerator';

interface MealCardProps {
  meal: Meal;
  onFeedback: (liked: boolean) => void;
  onSubstitution: (foodIndex: number) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onFeedback, onSubstitution }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const handleFeedback = (liked: boolean) => {
    setFeedback(liked);
    onFeedback(liked);
  };

  const saveComment = () => {
    console.log(`Comentário para ${meal.name}: ${comment}`);
    setShowComments(false);
    setComment('');
  };

  return (
    <Card className="overflow-hidden bg-white/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-nutri-green-50 to-nutri-green-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-nutri-dark-900">{meal.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-white">
                <Clock className="w-3 h-3 mr-1" />
                {meal.time}
              </Badge>
              <Badge variant="secondary">
                {Math.round(meal.totalCalories)} kcal
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant={feedback === true ? "default" : "outline"}
              size="sm"
              onClick={() => handleFeedback(true)}
              className={feedback === true ? "bg-green-500 hover:bg-green-600" : ""}
              title="Gostei desta refeição"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              variant={feedback === false ? "default" : "outline"}
              size="sm"
              onClick={() => handleFeedback(false)}
              className={feedback === false ? "bg-red-500 hover:bg-red-600" : ""}
              title="Não gostei desta refeição"
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              title="Adicionar comentário"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Alimentos da Refeição */}
        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-nutri-dark-800">Alimentos:</h4>
          <div className="space-y-2">
            {meal.foods.map((food, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-nutri-green-100 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-nutri-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-nutri-dark-900">{food.food.name}</div>
                    <div className="text-sm text-nutri-dark-600">
                      {food.quantity}g • {Math.round(food.calories)} kcal
                    </div>
                    {food.food.brand && (
                      <div className="text-xs text-nutri-green-600">{food.food.brand}</div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSubstitution(index)}
                  title="Substituir este alimento"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo Nutricional da Refeição */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-nutri-green-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-nutri-dark-900">
              {Math.round(meal.totalCalories)}
            </div>
            <div className="text-xs text-nutri-dark-600">Calorias</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-nutri-dark-900">
              {Math.round(meal.totalProtein)}g
            </div>
            <div className="text-xs text-nutri-dark-600">Proteínas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-nutri-dark-900">
              {Math.round(meal.totalCarbs)}g
            </div>
            <div className="text-xs text-nutri-dark-600">Carboidratos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-nutri-dark-900">
              {Math.round(meal.totalFat)}g
            </div>
            <div className="text-xs text-nutri-dark-600">Gorduras</div>
          </div>
        </div>

        {/* Receitas */}
        {meal.recipes && meal.recipes.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-nutri-dark-800 mb-2">Sugestões de Preparo:</h4>
            {meal.recipes.map((recipe) => (
              <div key={recipe.id} className="p-3 border rounded-lg bg-white/50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-nutri-dark-900">{recipe.name}</h5>
                  <Badge variant="outline">{recipe.prepTime} min</Badge>
                </div>
                <div className="text-sm text-nutri-dark-600">
                  <p className="mb-1"><strong>Ingredientes:</strong> {recipe.ingredients.join(', ')}</p>
                  <p><strong>Preparo:</strong> {recipe.instructions.join(' → ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Área de Comentários */}
        {showComments && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-2 text-nutri-dark-800">Adicionar Comentário:</h4>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deixe suas observações sobre esta refeição..."
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveComment}>
                Salvar Comentário
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowComments(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
