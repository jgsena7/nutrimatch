
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-nutri-blue-500 rounded-full">
            <Heart className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-nutri-blue-600">Nutri</span>
            <span className="text-nutri-green-600">Match</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => navigate('/')}
            className={`hover:text-nutri-blue-600 transition-colors ${
              location.pathname === '/' ? 'text-nutri-blue-600' : 'text-gray-700'
            }`}
          >
            Início
          </button>
          <button className="text-gray-700 hover:text-nutri-blue-600 transition-colors">
            Perfil Nutricional
          </button>
          <button className="text-gray-700 hover:text-nutri-blue-600 transition-colors">
            Fale Conosco
          </button>
          <button className="text-gray-700 hover:text-nutri-blue-600 transition-colors">
            Conheça Já
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/login')}
            className="text-gray-700 hover:text-nutri-blue-600 hover:bg-nutri-blue-50"
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
