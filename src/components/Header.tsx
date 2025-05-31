
import React from 'react';
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
          <button className="hover:text-nutri-green-400 transition-colors">
            Fale Conosco
          </button>
          <button className="hover:text-nutri-green-400 transition-colors">
            Conheça Já
          </button>
        </nav>

        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
