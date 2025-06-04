import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <span 
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-nutri-green-400">Nutri</span>Match
          </span>
          <h2 className="text-2xl font-bold mt-4 text-black">Criar Conta</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Nome Completo"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="pl-12 py-6 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-nutri-green-500 focus:border-nutri-green-500"
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Usuário"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="pl-12 py-6 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-nutri-green-500 focus:border-nutri-green-500"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="pl-12 py-6 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-nutri-green-500 focus:border-nutri-green-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="pl-12 pr-12 py-6 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-nutri-green-500 focus:border-nutri-green-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Senha"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="pl-12 pr-12 py-6 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-nutri-green-500 focus:border-nutri-green-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold text-white rounded-full mt-6"
            style={{ backgroundColor: 'rgb(37, 94, 57)' }}
          >
            Criar Conta
          </Button>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold"
                style={{ color: 'rgb(37, 94, 57)' }}
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
