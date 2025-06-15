
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Target, TrendingUp } from 'lucide-react';
import SidebarMenu from './SidebarMenu';
import MealAccordion from './MealAccordion';

const NutritionalProfilePage = () => {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Dados de exemplo para as refeições
  const meals = [
    {
      name: "Café da Manhã",
      details: [
        "2 fatias de pão integral",
        "1 xícara de café com leite desnatado",
        "1 banana média",
        "1 colher de sopa de geleia diet"
      ]
    },
    {
      name: "Almoço",
      details: [
        "150g de frango grelhado",
        "100g de arroz integral",
        "Salada verde com tomate e cenoura",
        "1 colher de sopa de azeite",
        "1 copo de suco natural"
      ]
    },
    {
      name: "Lanche da Tarde",
      details: [
        "1 iogurte natural",
        "1 punhado de castanhas",
        "1 maçã pequena"
      ]
    },
    {
      name: "Jantar",
      details: [
        "120g de peixe assado",
        "100g de batata doce",
        "Legumes refogados (abobrinha, brócolis)",
        "Salada de folhas verdes"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900 dark:from-black dark:via-gray-900 dark:to-gray-800">
      <SidebarMenu />
      
      <div className="pl-16 pr-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header do Perfil */}
          <Card className="mb-8 bg-white/95 backdrop-blur-sm dark:bg-black/80 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-nutri-green-500 text-white text-lg">
                    {user?.user_metadata?.full_name ? 
                      getInitials(user.user_metadata.full_name) : 
                      <User className="w-8 h-8" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl text-nutri-dark-900 dark:text-white">
                    {user?.user_metadata?.full_name || user?.email || 'Usuário'}
                  </CardTitle>
                  <p className="text-nutri-dark-600 dark:text-gray-300">Perfil Nutricional</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Cards de Metas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/95 backdrop-blur-sm dark:bg-black/80 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-nutri-green-100 dark:bg-nutri-green-900/50 rounded-lg">
                    <Target className="w-6 h-6 text-nutri-green-600 dark:text-nutri-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-nutri-dark-600 dark:text-gray-300">Meta Calórica</p>
                    <p className="text-2xl font-bold text-nutri-dark-900 dark:text-white">2.200 kcal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm dark:bg-black/80 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-nutri-dark-600 dark:text-gray-300">Consumido Hoje</p>
                    <p className="text-2xl font-bold text-nutri-dark-900 dark:text-white">1.850 kcal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm dark:bg-black/80 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                    <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-nutri-dark-600 dark:text-gray-300">Restante</p>
                    <p className="text-2xl font-bold text-nutri-dark-900 dark:text-white">350 kcal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accordion de Refeições */}
          <Card className="bg-white/95 backdrop-blur-sm dark:bg-black/80 dark:border-gray-800">
            <CardContent className="p-6">
              <MealAccordion meals={meals} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NutritionalProfilePage;
