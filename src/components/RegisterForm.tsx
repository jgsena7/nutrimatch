
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signInWithGoogle, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro no cadastro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      fullName: formData.fullName,
      username: formData.username
    });

    if (error) {
      console.error('Signup error:', error);
      
      let errorMessage = "Erro desconhecido. Tente novamente.";
      
      if (error.message === "User already registered") {
        errorMessage = "Este email já está cadastrado.";
      } else if (error.message.includes("Password")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta antes de fazer login."
      });
      
      // Reset form
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      setTimeout(() => navigate('/login'), 2000);
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      console.error('Google signup error:', error);
      toast({
        title: "Erro no cadastro com Google",
        description: error.message || "Erro desconhecido. Tente novamente.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha (mín. 6 caracteres)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="pl-12 pr-12 py-6 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-nutri-green-500 focus:border-nutri-green-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
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
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold text-white rounded-full mt-6"
            style={{ backgroundColor: 'rgb(37, 94, 57)' }}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold"
                style={{ color: 'rgb(37, 94, 57)' }}
                disabled={loading}
              >
                Faça login
              </button>
            </p>
            
            <p className="text-gray-400">ou</p>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="w-full py-6 text-lg border-2 border-gray-200 hover:border-nutri-green-500 rounded-full flex items-center justify-center"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Conectando...' : 'Continuar com o Google'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
