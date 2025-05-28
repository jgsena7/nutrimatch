
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-app-gray-200 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-app-blue-500 rounded-full">
            <Heart className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-app-blue-600">Nutri</span>
            <span className="text-app-green-600">Match</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => navigate('/')}
            className={`text-app-gray-700 hover:text-app-blue-600 transition-colors font-medium ${
              location.pathname === '/' ? 'text-app-blue-600 border-b-2 border-app-blue-600 pb-1' : ''
            }`}
          >
            Início
          </button>
          <button className="text-app-gray-700 hover:text-app-blue-600 transition-colors font-medium">
            Perfil Nutricional
          </button>
          <button className="text-app-gray-700 hover:text-app-blue-600 transition-colors font-medium">
            Sobre Nós
          </button>
          <button className="text-app-gray-700 hover:text-app-blue-600 transition-colors font-medium">
            Contato
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/login')}
            className="text-app-gray-700 hover:text-app-blue-600 hover:bg-app-blue-50"
          >
            <User className="w-4 h-4 mr-2" />
            Entrar
          </Button>
          <Button 
            size="sm"
            onClick={() => navigate('/register')}
            className="bg-app-green-500 hover:bg-app-green-600 text-white px-6 py-2 rounded-lg"
          >
            Cadastrar
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
