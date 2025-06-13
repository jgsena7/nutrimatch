
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu, X, Target, BarChart3, Database, Brain } from 'lucide-react';
import SidebarMenu from '@/components/SidebarMenu';
import { MealPlanInterface } from '@/components/MealPlanInterface';
import { ProgressReports } from '@/components/ProgressReports';
import NutritionAnalysis from '@/components/NutritionAnalysis';
import FoodDatabase from '@/components/FoodDatabase';

const NutritionalProfilePage = () => {
  const [activeTab, setActiveTab] = useState('current-plan');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  
  // Estado do perfil do usuário - pode ser obtido do contexto/state management
  const [userProfile, setUserProfile] = useState({
    name: 'João Silva',
    age: 30,
    height: 175,
    weight: 80,
    gender: 'masculino',
    activityLevel: 'moderado',
    goal: 'emagrecimento',
    foodPreferences: 'Carnes magras, vegetais, frutas',
    foodRestrictions: 'Lactose, glúten'
  });

  const menuItems = [
    {
      id: 'current-plan',
      label: 'Plano Atual',
      icon: Target,
      description: 'Visualize seu plano alimentar atual'
    },
    {
      id: 'smart-generator',
      label: 'Gerador Inteligente',
      icon: Brain,
      description: 'Gere planos personalizados com IA'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Acompanhe seu progresso e evolução'
    },
    {
      id: 'food-database',
      label: 'Base de Alimentos',
      icon: Database,
      description: 'Busque informações nutricionais completas'
    }
  ];

  const currentMenuItem = menuItems.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900">
      <SidebarMenu />
      
      <div className="pl-16 pr-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Card className="mb-8 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl text-nutri-dark-900">
                    <span className="text-nutri-green-500">Nutri</span>Match Pro
                  </CardTitle>
                  <p className="text-nutri-dark-600 mt-2">
                    Sistema Inteligente de Planos Alimentares Personalizados
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSideMenuOpen(!sideMenuOpen)}
                  className="lg:hidden"
                >
                  {sideMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Menu de Navegação Principal */}
          <Card className="mb-8 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "outline"}
                    className={`h-auto flex-col p-4 ${
                      activeTab === item.id 
                        ? "bg-nutri-green-500 hover:bg-nutri-green-600 text-white" 
                        : "hover:bg-nutri-green-50"
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="w-6 h-6 mb-2" />
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="text-xs text-center opacity-75 mt-1">
                      {item.description}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Breadcrumb */}
          {currentMenuItem && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-white/80">
                <currentMenuItem.icon className="w-5 h-5" />
                <span className="text-lg font-medium">{currentMenuItem.label}</span>
                <span className="text-sm">- {currentMenuItem.description}</span>
              </div>
            </div>
          )}

          {/* Conteúdo Principal */}
          <div className="space-y-6">
            {activeTab === 'current-plan' && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <NutritionAnalysis />
                </CardContent>
              </Card>
            )}

            {activeTab === 'smart-generator' && (
              <div className="space-y-6">
                <MealPlanInterface userProfile={userProfile} />
              </div>
            )}

            {activeTab === 'reports' && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <ProgressReports />
                </CardContent>
              </Card>
            )}

            {activeTab === 'food-database' && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <FoodDatabase />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalProfilePage;
