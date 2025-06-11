
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
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

const NutritionalProfileViewPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<NutritionalProfileData | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="max-w-4xl mx-auto">
          {/* Header com botão voltar */}
          <div className="mb-6">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
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
                    <p className="text-nutri-dark-600">Perfil Nutricional</p>
                  </div>
                </div>
                <Button
                  onClick={handleExportPDF}
                  className="bg-nutri-green-500 hover:bg-nutri-green-600"
                >
                  Exportar PDF
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Cards de Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-nutri-dark-600">Idade</p>
                  <p className="text-2xl font-bold text-nutri-dark-900">{profileData.age}</p>
                  <p className="text-xs text-nutri-dark-500">anos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-nutri-dark-600">Altura</p>
                  <p className="text-2xl font-bold text-nutri-dark-900">{profileData.height}</p>
                  <p className="text-xs text-nutri-dark-500">cm</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-nutri-dark-600">Peso</p>
                  <p className="text-2xl font-bold text-nutri-dark-900">{profileData.weight}</p>
                  <p className="text-xs text-nutri-dark-500">kg</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-nutri-dark-600">IMC</p>
                  <p className="text-2xl font-bold text-nutri-dark-900">
                    {calculateBMI(profileData.weight, profileData.height)}
                  </p>
                  <p className="text-xs text-nutri-dark-500">kg/m²</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-nutri-dark-900">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-nutri-dark-600">Gênero</p>
                  <p className="text-nutri-dark-900 capitalize">{profileData.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-nutri-dark-600">Nível de Atividade</p>
                  <p className="text-nutri-dark-900 capitalize">{profileData.activity_level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-nutri-dark-600">Objetivo</p>
                  <p className="text-nutri-dark-900 capitalize">{profileData.goal}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-nutri-dark-900">Preferências Alimentares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
      </div>
    </div>
  );
};

export default NutritionalProfileViewPage;
