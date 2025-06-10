
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import { User, Edit3, Save, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          username: data.username || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        // Se não existe perfil, usar dados do user metadata
        setProfile({
          full_name: user?.user_metadata?.full_name || '',
          username: user?.user_metadata?.username || '',
          avatar_url: user?.user_metadata?.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-nutri-green-500 text-white text-xl">
                  {profile.full_name ? getInitials(profile.full_name) : <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold text-nutri-dark-900">
              Meu Perfil
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                  Nome Completo
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Nome de Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="avatar_url" className="text-sm font-medium text-gray-700">
                  URL da Foto de Perfil
                </Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-100' : ''}`}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-nutri-green-500 hover:bg-nutri-green-600"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button
                    onClick={updateProfile}
                    disabled={loading}
                    className="flex-1 bg-nutri-green-500 hover:bg-nutri-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile(); // Restaura os dados originais
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
