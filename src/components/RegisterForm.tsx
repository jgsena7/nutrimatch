
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Conta criada com sucesso!",
      description: "Redirecionando para o dashboard...",
    });
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-blue-50 via-white to-app-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border border-app-gray-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-app-blue-500 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-app-gray-900">Criar Conta</h2>
          <p className="text-app-gray-600 mt-2">Junte-se à comunidade NutriMatch</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Nome Completo"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="pl-12 py-6 text-lg border border-app-gray-300 rounded-lg focus:ring-2 focus:ring-app-blue-500 focus:border-app-blue-500"
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Usuário"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="pl-12 py-6 text-lg border border-app-gray-300 rounded-lg focus:ring-2 focus:ring-app-blue-500 focus:border-app-blue-500"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray-400 w-5 h-5" />
            <Input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="pl-12 py-6 text-lg border border-app-gray-300 rounded-lg focus:ring-2 focus:ring-app-blue-500 focus:border-app-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray-400 w-5 h-5" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="pl-12 pr-12 py-6 text-lg border border-app-gray-300 rounded-lg focus:ring-2 focus:ring-app-blue-500 focus:border-app-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-gray-400 hover:text-app-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray-400 w-5 h-5" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Senha"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="pl-12 pr-12 py-6 text-lg border border-app-gray-300 rounded-lg focus:ring-2 focus:ring-app-blue-500 focus:border-app-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-gray-400 hover:text-app-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold bg-app-blue-600 hover:bg-app-blue-700 text-white rounded-lg mt-6"
          >
            Criar Conta
          </Button>

          <div className="text-center mt-6">
            <p className="text-app-gray-600">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-app-blue-600 hover:text-app-blue-700 font-semibold"
              >
                Faça login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
