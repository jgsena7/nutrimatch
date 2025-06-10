
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface MealItem {
  name: string;
  details: string[];
}

interface MealAccordionProps {
  meals: MealItem[];
}

const MealAccordion: React.FC<MealAccordionProps> = ({ meals }) => {
  const [expandedMeals, setExpandedMeals] = useState<Set<number>>(new Set());

  const toggleMeal = (index: number) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMeals(newExpanded);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-nutri-dark-900 mb-4">
        Refeições do Dia
      </h3>
      
      {meals.map((meal, index) => (
        <Card key={index} className="overflow-hidden">
          <div
            onClick={() => toggleMeal(index)}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-nutri-green-50 transition-colors"
          >
            <h4 className="text-lg font-medium text-nutri-dark-800">
              {meal.name}
            </h4>
            {expandedMeals.has(index) ? (
              <ChevronUp className="w-5 h-5 text-nutri-green-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-nutri-green-500" />
            )}
          </div>
          
          {expandedMeals.has(index) && (
            <CardContent className="pt-0 animate-accordion-down">
              <div className="border-t border-gray-200 pt-4">
                <ul className="space-y-2">
                  {meal.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="text-nutri-dark-600 flex items-start"
                    >
                      <span className="w-2 h-2 bg-nutri-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default MealAccordion;
