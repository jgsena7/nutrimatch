
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, RefreshCw } from "lucide-react";

interface MainMealPlanHeaderProps {
  displayedGoals: { calories: number; protein: number; carbs: number; fat: number };
  isGenerating: boolean;
  onEditGoals: () => void;
  onGeneratePlan: () => void;
}

const MainMealPlanHeader: React.FC<MainMealPlanHeaderProps> = ({
  displayedGoals,
  isGenerating,
  onEditGoals,
  onGeneratePlan,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-nutri-green-500" />
            Suas Metas Nutricionais Diárias
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={onEditGoals} size="sm" variant="outline">
              Editar Metas
            </Button>
            <Button
              onClick={onGeneratePlan}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              Gerar Novo Plano
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-nutri-green-600">{displayedGoals.calories}</div>
            <div className="text-sm text-gray-600">Meta Calorias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{displayedGoals.protein}g</div>
            <div className="text-sm text-gray-600">Meta Proteínas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{displayedGoals.carbs}g</div>
            <div className="text-sm text-gray-600">Meta Carboidratos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{displayedGoals.fat}g</div>
            <div className="text-sm text-gray-600">Meta Gorduras</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainMealPlanHeader;
