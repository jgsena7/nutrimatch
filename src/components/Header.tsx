
import React from 'react';
import { Button } from "@/components/ui/button";
import { User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const scrollToFooter = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado com sucesso!",
        description: "Você foi desconectado.",
      });
      navigate('/');
    }
  };

  return (
    <header className="bg-nutri-dark-900 text-white py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <span className="text-xl font-bold">
            <span className="text-nutri-green-400">Nutri</span>Match
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => navigate('/')}
            className={`hover:text-nutri-green-400 transition-colors ${
              location.pathname === '/' ? 'text-nutri-green-400' : ''
            }`}
          >
            Início
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className={`hover:text-nutri-green-400 transition-colors ${
              location.pathname === '/dashboard' ? 'text-nutri-green-400' : ''
            }`}
          >
            Perfil Nutricional
          </button>
          <button 
            onClick={scrollToFooter}
            className="hover:text-nutri-green-400 transition-colors"
          >
            Fale Conosco
          </button>
          {!user && (
            <button 
              onClick={() => navigate('/login')}
              className="hover:text-nutri-green-400 transition-colors"
            >
              Conheça Já
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-nutri-green-400">
                Olá, {user.user_metadata?.full_name || user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:text-nutri-green-400 hover:bg-nutri-dark-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/login')}
                className="text-white hover:text-nutri-green-400 hover:bg-nutri-dark-700"
              >
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/register')}
                className="bg-nutri-green-500 hover:bg-nutri-green-600 text-white"
              >
                Cadastrar
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
