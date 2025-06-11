import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const NutritionalProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar o perfil.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('nutritional_profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          gender: formData.gender,
          activity_level: formData.activityLevel,
          goal: formData.goal,
          food_preferences: formData.foodPreferences,
          food_restrictions: formData.foodRestrictions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Perfil salvo com sucesso!",
        description: "Seu plano alimentar personalizado foi criado."
      });
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para exportar o perfil.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('nutritional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        toast({
          title: "Erro",
          description: "Perfil não encontrado. Salve o perfil primeiro.",
          variant: "destructive"
        });
        return;
      }

      // Gerar PDF
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('Perfil Nutricional - NutriMatch', 20, 30);
      
      pdf.setFontSize(12);
      let yPos = 50;
      
      pdf.text(`Nome: ${data.name}`, 20, yPos);
      yPos += 10;
      pdf.text(`Idade: ${data.age} anos`, 20, yPos);
      yPos += 10;
      pdf.text(`Altura: ${data.height} cm`, 20, yPos);
      yPos += 10;
      pdf.text(`Peso: ${data.weight} kg`, 20, yPos);
      yPos += 10;
      pdf.text(`Gênero: ${data.gender}`, 20, yPos);
      yPos += 10;
      pdf.text(`Nível de Atividade: ${data.activity_level}`, 20, yPos);
      yPos += 10;
      pdf.text(`Objetivo: ${data.goal}`, 20, yPos);
      yPos += 10;
      
      if (data.food_preferences) {
        pdf.text(`Preferências Alimentares: ${data.food_preferences}`, 20, yPos);
        yPos += 10;
      }
      
      if (data.food_restrictions) {
        pdf.text(`Restrições Alimentares: ${data.food_restrictions}`, 20, yPos);
      }

      pdf.save('perfil-nutricional.pdf');
      
      toast({
        title: "PDF exportado!",
        description: "Seu perfil nutricional foi baixado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive"
      });
    }
  };

  const handleVisualize = () => {
    navigate('/nutritional-profile-view');
  };

  return <Card className="max-w-2xl mx-auto bg-gray-100 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-nutri-dark-900 text-black">
          Perfil Nutricional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">Nome</Label>
              <Input id="name" placeholder="Digite o seu nome" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} className="bg-white border border-gray-300 rounded-full py-3" required />
            </div>
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">Idade</Label>
              <Input id="age" type="number" placeholder="Digite a sua idade" value={formData.age} onChange={e => setFormData({
              ...formData,
              age: e.target.value
            })} className="bg-white border border-gray-300 rounded-full py-3" required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height" className="text-sm font-medium text-gray-700 mb-2 block">Altura (cm)</Label>
              <Input id="height" type="number" step="0.1" placeholder="Digite a sua altura" value={formData.height} onChange={e => setFormData({
              ...formData,
              height: e.target.value
            })} className="bg-white border border-gray-300 rounded-full py-3" required />
            </div>
            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700 mb-2 block">Peso (kg)</Label>
              <Input id="weight" type="number" step="0.1" placeholder="Digite o seu peso" value={formData.weight} onChange={e => setFormData({
              ...formData,
              weight: e.target.value
            })} className="bg-white border border-gray-300 rounded-full py-3" required />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Gênero</Label>
            <RadioGroup value={formData.gender} onValueChange={value => setFormData({
            ...formData,
            gender: value
          })} required>
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
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Nível de atividade física</Label>
            <RadioGroup value={formData.activityLevel} onValueChange={value => setFormData({
            ...formData,
            activityLevel: value
          })} required>
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
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Objetivo de saúde</Label>
            <RadioGroup value={formData.goal} onValueChange={value => setFormData({
            ...formData,
            goal: value
          })} required>
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
              <Input id="foodPreferences" placeholder="Digite as suas preferências" value={formData.foodPreferences} onChange={e => setFormData({
              ...formData,
              foodPreferences: e.target.value
            })} className="bg-white border border-gray-300 rounded-full py-3" />
            </div>
            <div>
              <Label htmlFor="foodRestrictions" className="text-sm font-medium text-gray-700 mb-2 block">Restrições Alimentares</Label>
              <Input id="foodRestrictions" placeholder="Digite as suas restrições" value={formData.foodRestrictions} onChange={e => setFormData({
              ...formData,
              foodRestrictions: e.target.value
            })} className="bg-white border border-gray-300 rounded-full py-3" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-nutri-green-500 hover:bg-nutri-green-600 text-white py-3 rounded-full font-semibold"
            >
              {loading ? 'Salvando...' : 'Salvar Plano'}
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
    </Card>;
};

export default NutritionalProfile;
