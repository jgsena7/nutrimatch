
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-nutri-green-600" strokeWidth={2} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-nutri-green-600"
            >
              Esqueceu a senha?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold bg-nutri-green-600 hover:bg-nutri-green-700 text-white rounded-full"
          >
            Entrar
          </Button>

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-nutri-green-600 hover:text-nutri-green-700 font-semibold"
              >
                Registre-se
              </button>
            </p>
            <p className="text-gray-400">ou</p>
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 text-lg border-2 border-gray-200 hover:border-nutri-green-500 rounded-full"
            >
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjU2IDEyLjI1QzIyLjU2IDExLjQ3IDIyLjQ5IDEwLjcyIDIyLjM2IDEwSDEyVjE0LjI2SDIxLjM1QzIxLjAzIDE1LjYgMjAuMjEgMTYuNzQgMTguOTYgMTcuNDZWMjAuMjZIMjAuOTZDMjEuOTcgMTguMzUgMjIuNTYgMTUuNDcgMjIuNTYgMTIuMjVaIiBmaWxsPSIjNDI4NUY0Ii8+CjxwYXRoIGQ9Ik0xMiAyM0M5LjI1IDIzIDYuNzIgMjEuODYgNS4wOCAyMC4wNkw2Ljk2IDE3LjM2QzguNzIgMTguNTcgMTAuNjcgMTkuMjUgMTIgMTkuMjVDMTQuMDUgMTkuMjUgMTUuNzggMTguNjMgMTYuOTYgMTcuNDZMMTguOTYgMjAuMjZDMTcuMzQgMjEuNjYgMTQuODcgMjMgMTIgMjNaIiBmaWxsPSIjMzRBODUzIi8+CjxwYXRoIGQ9Ik01LjA4IDIwLjA2QzMuNDQgMTguMjYgMi41IDE1Ljk0IDIuNSAxMy4yNUMyLjUgMTAuNTYgMy40NCA4LjI0IDUuMDggNi40NEw2Ljk2IDkuMTRDNi40NiAxMC4zMiA2LjE4IDExLjc1IDYuMTggMTMuMjVDNi4xOCAxNC43NSA2LjQ2IDE2LjE4IDYuOTYgMTcuMzZMNS4wOCAyMC4wNloiIGZpbGw9IiNGQkJDMDQiLz4KPHA/cm5nIGQ9Ik0xMiA5LjVDMTMuMzggOS41IDE0LjY1IDEwLjAzIDE1LjY5IDEwLjk3TDE3LjUgOS4xNEMxNS45MyA3LjY5IDEzLjc1IDYuNzUgMTIgNi43NUM5LjI1IDYuNzUgNi43MiA3Ljg5IDUuMDggOS42OUw2Ljk2IDEyLjM5QzguNzIgMTEuMTggMTAuNjcgMTAuNSAxMiAxMC41WiIgZmlsbD0iI0JBNDM0NyIvPgo8L3N2Zz4K" alt="Google" className="w-5 h-5 mr-2" />
              Continuar com o Google
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
