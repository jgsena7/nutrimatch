
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User, Target, TrendingUp, Brain, Database, FileText, Menu, ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { calculateNutritionalNeeds } from '@/utils/nutritionCalculator';
import MealAccordion from '@/components/MealAccordion';
import SmartMealPlanGenerator from '@/components/SmartMealPlanGenerator';
import FoodSearch from '@/components/FoodSearch';
import jsPDF from 'jspdf';

interface NutritionalProfileData {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity_level: string;
  goal: string;
  food_preferences?: string;
  food_restrictions?: string;
  created_at: string;
}

interface FoodItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  source: string;
  nutrition: {
    energy_kcal: number;
    proteins: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sodium: number;
    sugars: number;
  };
  categories: string;
}

const NutritionalProfileConsolidated = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<NutritionalProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedFoods, setSavedFoods] = useState<FoodItem[]>([]);
  const [activeTab, setActiveTab] = useState('current');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para ver o perfil.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('nutritional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Perfil não encontrado",
            description: "Você ainda não criou um perfil nutricional.",
            variant: "destructive"
          });
          navigate('/nutritional-profile');
          return;
        }
        throw error;
      }

      setProfileData(data);
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = (food: FoodItem) => {
    const exists = savedFoods.find(f => f.id === food.id && f.source === food.source);
    
    if (exists) {
      toast({
        title: "Alimento já adicionado",
        description: "Este alimento já está na sua lista",
        variant: "destructive"
      });
      return;
    }

    setSavedFoods(prev => [...prev, food]);
    toast({
      title: "Alimento adicionado!",
      description: `${food.name} foi adicionado à sua lista`,
    });
  };

  const handleRemoveFood = (foodId: string, source: string) => {
    setSavedFoods(prev => prev.filter(f => !(f.id === foodId && f.source === source)));
    toast({
      title: "Alimento removido",
      description: "O alimento foi removido da sua lista",
    });
  };

  const handleExportPDF = () => {
    if (!profileData) return;

    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text('Perfil Nutricional - NutriMatch', 20, 30);
    
    pdf.setFontSize(12);
    let yPos = 50;
    
    pdf.text(`Nome: ${profileData.name}`, 20, yPos);
    yPos += 10;
    pdf.text(`Idade: ${profileData.age} anos`, 20, yPos);
    yPos += 10;
    pdf.text(`Altura: ${profileData.height} cm`, 20, yPos);
    yPos += 10;
    pdf.text(`Peso: ${profileData.weight} kg`, 20, yPos);
    yPos += 10;
    pdf.text(`Gênero: ${profileData.gender}`, 20, yPos);
    yPos += 10;
    pdf.text(`Nível de Atividade: ${profileData.activity_level}`, 20, yPos);
    yPos += 10;
    pdf.text(`Objetivo: ${profileData.goal}`, 20, yPos);
    yPos += 10;
    
    if (profileData.food_preferences) {
      pdf.text(`Preferências Alimentares: ${profileData.food_preferences}`, 20, yPos);
      yPos += 10;
    }
    
    if (profileData.food_restrictions) {
      pdf.text(`Restrições Alimentares: ${profileData.food_restrictions}`, 20, yPos);
    }

    pdf.save('perfil-nutricional.pdf');
    
    toast({
      title: "PDF exportado!",
      description: "Seu perfil nutricional foi baixado com sucesso."
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateNutritionalData = () => {
    if (!profileData) return null;
    
    return calculateNutritionalNeeds({
      age: profileData.age,
      height: profileData.height,
      weight: profileData.weight,
      gender: profileData.gender,
      activity_level: profileData.activity_level,
      goal: profileData.goal
    });
  };

  const nutritionalNeeds = calculateNutritionalData();

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

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User, tab: 'profile' },
    { id: 'current', label: 'Plano Atual', icon: Target, tab: 'current' },
    { id: 'smart', label: 'Gerador Inteligente', icon: Brain, tab: 'smart' },
    { id: 'database', label: 'Base de Alimentos', icon: Database, tab: 'database' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando perfil...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Perfil não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header com menu hambúrguer */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Menu className="w-4 h-4 mr-2" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white">
                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-4">Navegação</h3>
                  <div className="space-y-2">
                    {menuItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeTab === item.tab ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab(item.tab);
                          setIsMenuOpen(false);
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Header do Perfil */}
          <Card className="mb-8 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-nutri-green-500 text-white text-lg">
                      {getInitials(profileData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl text-nutri-dark-900">
                      {profileData.name}
                    </CardTitle>
                    <p className="text-nutri-dark-600">Perfil Nutricional Completo</p>
                  </div>
                </div>
                <Button
                  onClick={handleExportPDF}
                  className="bg-nutri-green-500 hover:bg-nutri-green-600"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Cards de Metas */}
          {nutritionalNeeds && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-nutri-green-100 rounded-lg">
                      <Target className="w-6 h-6 text-nutri-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-nutri-dark-600">Meta Calórica</p>
                      <p className="text-2xl font-bold text-nutri-dark-900">{nutritionalNeeds.calories} kcal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-nutri-dark-600">Proteína</p>
                    <p className="text-2xl font-bold text-nutri-dark-900">{nutritionalNeeds.protein}g</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-nutri-dark-600">Carboidratos</p>
                    <p className="text-2xl font-bold text-nutri-dark-900">{nutritionalNeeds.carbs}g</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-nutri-dark-600">Gorduras</p>
                    <p className="text-2xl font-bold text-nutri-dark-900">{nutritionalNeeds.fat}g</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Conteúdo baseado na aba ativa */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Informações do Perfil</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">Idade</p>
                          <p className="text-nutri-dark-900">{profileData.age} anos</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">Altura</p>
                          <p className="text-nutri-dark-900">{profileData.height} cm</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">Peso</p>
                          <p className="text-nutri-dark-900">{profileData.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">IMC</p>
                          <p className="text-nutri-dark-900">{calculateBMI(profileData.weight, profileData.height)} kg/m²</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">Gênero</p>
                          <p className="text-nutri-dark-900 capitalize">{profileData.gender}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Objetivos e Preferências</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">Nível de Atividade</p>
                          <p className="text-nutri-dark-900 capitalize">{profileData.activity_level}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">Objetivo</p>
                          <p className="text-nutri-dark-900 capitalize">{profileData.goal}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">Preferências</p>
                          <p className="text-nutri-dark-900">
                            {profileData.food_preferences || 'Não informado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-nutri-dark-600">Restrições</p>
                          <p className="text-nutri-dark-900">
                            {profileData.food_restrictions || 'Não informado'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'current' && (
                <MealAccordion meals={meals} />
              )}

              {activeTab === 'smart' && (
                <SmartMealPlanGenerator />
              )}

              {activeTab === 'database' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Base de Dados de Alimentos</h2>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <FoodSearch onAddFood={handleAddFood} />
                    </div>

                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Minha Lista de Alimentos ({savedFoods.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {savedFoods.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Nenhum alimento salvo ainda.</p>
                              <p className="text-sm">Use a busca ao lado para adicionar alimentos.</p>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {savedFoods.map((food) => (
                                <div key={`${food.source}-${food.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{food.name}</h4>
                                    {food.brand && (
                                      <p className="text-sm text-gray-600">{food.brand}</p>
                                    )}
                                    <div className="flex gap-2 mt-1">
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {food.source === 'openfoodfacts' ? 'OFF' : 'USDA'}
                                      </span>
                                      <span className="text-xs text-gray-600">
                                        {Math.round(food.nutrition.energy_kcal)} kcal
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFood(food.id, food.source)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {savedFoods.length > 0 && (
                        <Card className="mt-4">
                          <CardHeader>
                            <CardTitle className="text-lg">Resumo Nutricional</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Total de Calorias:</span>
                                <p className="text-lg font-bold text-nutri-green-600">
                                  {Math.round(savedFoods.reduce((sum, food) => sum + food.nutrition.energy_kcal, 0))} kcal
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Total de Proteínas:</span>
                                <p className="text-lg font-bold text-nutri-green-600">
                                  {savedFoods.reduce((sum, food) => sum + food.nutrition.proteins, 0).toFixed(1)}g
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Total de Carboidratos:</span>
                                <p className="text-lg font-bold text-nutri-green-600">
                                  {savedFoods.reduce((sum, food) => sum + food.nutrition.carbohydrates, 0).toFixed(1)}g
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Total de Gorduras:</span>
                                <p className="text-lg font-bold text-nutri-green-600">
                                  {savedFoods.reduce((sum, food) => sum + food.nutrition.fat, 0).toFixed(1)}g
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NutritionalProfileConsolidated;
