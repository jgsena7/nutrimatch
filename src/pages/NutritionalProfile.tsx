import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu, X, Target, BarChart3, Database, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import SidebarMenu from '@/components/SidebarMenu';
import MealPlanGenerator from '@/components/MealPlanGenerator';
import { ProgressReports } from '@/components/ProgressReports';
import FoodDatabase from '@/components/FoodDatabase';
import { useToast } from "@/hooks/use-toast";

const NutritionalProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('current-plan');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        // Buscar o perfil mais recente do usuário
        const { data, error } = await supabase
          .from('nutritional_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar perfil:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar seu perfil nutricional.",
            variant: "destructive",
          });
        } else if (data) {
          setUserProfile(data);
        } else {
          // Se não há perfil, mostrar mensagem para criar um
          toast({
            title: "Perfil não encontrado",
            description: "Você precisa criar seu perfil nutricional primeiro. Redirecionando...",
          });
          
          // Redirecionar para o dashboard após 2 segundos
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar seu perfil. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const menuItems = [
    {
      id: 'current-plan',
      label: 'Plano Atual',
      icon: Target,
      description: 'Visualize seu plano alimentar personalizado'
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
      description: 'Busque informações nutricionais'
    }
  ];

  const currentMenuItem = menuItems.find(item => item.id === activeTab);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando seu perfil nutricional...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-4">Perfil não encontrado</h3>
            <p className="text-gray-600 mb-4">
              Você precisa criar seu perfil nutricional primeiro para visualizar seu plano alimentar.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Criar Perfil Nutricional
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  <p className="text-sm text-nutri-dark-500 mt-1">
                    Olá, {userProfile.name}! Seu plano está personalizado para seu objetivo de {userProfile.goal}.
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
            {(activeTab === 'current-plan' || activeTab === 'smart-generator') && userProfile && (
              <div className="space-y-6">
                <Card className="bg-white/95 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <MealPlanGenerator userProfile={userProfile} />
                  </CardContent>
                </Card>
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
