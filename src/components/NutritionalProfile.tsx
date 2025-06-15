import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const NutritionalProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    activityLevel: '',
    goal: '',
    foodPreferences: '',
    foodRestrictions: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar o perfil.",
        variant: "destructive",
      });
      return;
    }

    // Validar campos obrigatórios
    if (!formData.name || !formData.age || !formData.height || !formData.weight || 
        !formData.gender || !formData.activityLevel || !formData.goal) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const profileData = {
        user_id: user.id,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        gender: formData.gender,
        activity_level: formData.activityLevel,
        goal: formData.goal,
        food_preferences: formData.foodPreferences.trim() || null,
        food_restrictions: formData.foodRestrictions.trim() || null
      };

      // Buscar todos os perfis do usuário
      const { data: existingProfiles, error: checkError } = await supabase
        .from('nutritional_profiles')
        .select('id')
        .eq('user_id', user.id);

      if (checkError) {
        console.error('Erro ao verificar perfis existentes:', checkError);
        throw checkError;
      }

      let result;
      if (existingProfiles && existingProfiles.length > 0) {
        // Se existem perfis, pegar o mais recente e atualizar
        const { data: latestProfile, error: latestError } = await supabase
          .from('nutritional_profiles')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (latestError) {
          console.error('Erro ao buscar perfil mais recente:', latestError);
          throw latestError;
        }

        // Atualizar o perfil mais recente
        result = await supabase
          .from('nutritional_profiles')
          .update(profileData)
          .eq('id', latestProfile.id);
      } else {
        // Criar novo perfil
        result = await supabase
          .from('nutritional_profiles')
          .insert([profileData]);
      }

      if (result.error) {
        console.error('Erro ao salvar perfil:', result.error);
        throw result.error;
      }

      toast({
        title: "Perfil salvo com sucesso!",
        description: "Seu plano alimentar personalizado está sendo criado.",
      });

      // Aguardar um momento para o usuário ver a mensagem
      setTimeout(() => {
        navigate('/nutritional-profile');
      }, 1500);

    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Ocorreu um erro ao salvar suas informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Exportando PDF...",
      description: "Seu perfil nutricional será baixado em instantes."
    });
  };

  const handleVisualize = () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para visualizar o plano.",
        variant: "destructive",
      });
      return;
    }
    navigate('/nutritional-profile');
  };

  return (
    <Card className="max-w-2xl mx-auto bg-gray-100 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-nutri-dark-900 text-black">
          Perfil Nutricional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">Nome *</Label>
              <Input 
                id="name" 
                placeholder="Digite o seu nome" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                className="bg-white border border-gray-300 rounded-full py-3"
                required
              />
            </div>
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">Idade *</Label>
              <Input 
                id="age" 
                placeholder="Digite a sua idade" 
                type="number"
                min="1"
                max="120"
                value={formData.age} 
                onChange={e => setFormData({ ...formData, age: e.target.value })} 
                className="bg-white border border-gray-300 rounded-full py-3"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height" className="text-sm font-medium text-gray-700 mb-2 block">Altura (cm) *</Label>
              <Input 
                id="height" 
                placeholder="Digite a sua altura" 
                type="number"
                min="100"
                max="250"
                step="0.1"
                value={formData.height} 
                onChange={e => setFormData({ ...formData, height: e.target.value })} 
                className="bg-white border border-gray-300 rounded-full py-3"
                required
              />
            </div>
            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700 mb-2 block">Peso (kg) *</Label>
              <Input 
                id="weight" 
                placeholder="Digite o seu peso" 
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={formData.weight} 
                onChange={e => setFormData({ ...formData, weight: e.target.value })} 
                className="bg-white border border-gray-300 rounded-full py-3"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Gênero *</Label>
            <RadioGroup 
              value={formData.gender} 
              onValueChange={value => setFormData({ ...formData, gender: value })}
              required
            >
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feminino" id="feminino" />
                  <Label htmlFor="feminino">Feminino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="masculino" id="masculino" />
                  <Label htmlFor="masculino">Masculino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outros" id="outros" />
                  <Label htmlFor="outros">Outros</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prefiro-nao-dizer" id="prefiro-nao-dizer" />
                  <Label htmlFor="prefiro-nao-dizer">Prefiro não dizer</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Nível de atividade física *</Label>
            <RadioGroup 
              value={formData.activityLevel} 
              onValueChange={value => setFormData({ ...formData, activityLevel: value })}
              required
            >
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentario" id="sedentario" />
                  <Label htmlFor="sedentario">Sedentário</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="leve" id="leve" />
                  <Label htmlFor="leve">Leve</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderado" id="moderado" />
                  <Label htmlFor="moderado">Moderado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intenso" id="intenso" />
                  <Label htmlFor="intenso">Intenso</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Objetivo de saúde *</Label>
            <RadioGroup 
              value={formData.goal} 
              onValueChange={value => setFormData({ ...formData, goal: value })}
              required
            >
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emagrecimento" id="emagrecimento" />
                  <Label htmlFor="emagrecimento">Emagrecimento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ganho-massa" id="ganho-massa" />
                  <Label htmlFor="ganho-massa">Ganho de massa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manutencao" id="manutencao" />
                  <Label htmlFor="manutencao">Manutenção</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="foodPreferences" className="text-sm font-medium text-gray-700 mb-2 block">Preferências Alimentares</Label>
              <Input 
                id="foodPreferences" 
                placeholder="Digite as suas preferências" 
                value={formData.foodPreferences} 
                onChange={e => setFormData({ ...formData, foodPreferences: e.target.value })} 
                className="bg-white border border-gray-300 rounded-full py-3" 
              />
            </div>
            <div>
              <Label htmlFor="foodRestrictions" className="text-sm font-medium text-gray-700 mb-2 block">Restrições Alimentares</Label>
              <Input 
                id="foodRestrictions" 
                placeholder="Digite as suas restrições" 
                value={formData.foodRestrictions} 
                onChange={e => setFormData({ ...formData, foodRestrictions: e.target.value })} 
                className="bg-white border border-gray-300 rounded-full py-3" 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-nutri-green-500 hover:bg-nutri-green-600 text-white py-3 rounded-full font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Plano'
              )}
            </Button>
            <Button 
              type="button" 
              onClick={handleExport} 
              className="flex-1 bg-nutri-green-600 hover:bg-nutri-green-700 text-white py-3 rounded-full font-semibold"
            >
              Exportar (PDF)
            </Button>
          </div>
          
          <Button 
            type="button" 
            onClick={handleVisualize} 
            className="w-full bg-nutri-green-400 hover:bg-nutri-green-500 text-white py-3 rounded-full font-semibold"
          >
            Visualizar Plano
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NutritionalProfile;
