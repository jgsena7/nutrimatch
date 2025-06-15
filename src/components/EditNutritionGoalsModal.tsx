
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface EditNutritionGoalsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (goals: { calories: number; protein: number; carbs: number; fat: number }) => void;
  currentGoals: { calories: number; protein: number; carbs: number; fat: number };
}

const EditNutritionGoalsModal: React.FC<EditNutritionGoalsModalProps> = ({
  open,
  onClose,
  onSave,
  currentGoals
}) => {
  const [goals, setGoals] = useState({ ...currentGoals });
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof goals, value: string) => {
    setGoals({ ...goals, [field]: Number(value) });
  };

  const handleSubmit = () => {
    if (
      !goals.calories ||
      !goals.protein ||
      !goals.carbs ||
      !goals.fat ||
      goals.calories < 500 ||
      goals.protein < 10 ||
      goals.carbs < 10 ||
      goals.fat < 5
    ) {
      setError("Preencha todos os campos corretamente com valores adequados.");
      return;
    }
    setError('');
    onSave(goals);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Metas Nutricionais</DialogTitle>
          <DialogDescription>
            Altere suas metas diárias conforme necessário. As refeições serão geradas conforme essas metas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium">Calorias (kcal)</label>
            <Input
              type="number"
              min={500}
              value={goals.calories}
              onChange={e => handleChange("calories", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Proteína (g)</label>
            <Input
              type="number"
              min={10}
              value={goals.protein}
              onChange={e => handleChange("protein", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Carboidratos (g)</label>
            <Input
              type="number"
              min={10}
              value={goals.carbs}
              onChange={e => handleChange("carbs", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Gorduras (g)</label>
            <Input
              type="number"
              min={5}
              value={goals.fat}
              onChange={e => handleChange("fat", e.target.value)}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Salvar Metas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditNutritionGoalsModal;
