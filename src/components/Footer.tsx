
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-app-gray-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold">
            Pronto para transformar sua nutrição?
          </h2>
          <h3 className="text-xl text-app-gray-300">
            Junte-se a milhares de pessoas que já mudaram sua vida
          </h3>
          <Button 
            size="lg"
            className="bg-app-green-500 hover:bg-app-green-600 text-white px-8 py-6 text-lg rounded-lg"
          >
            Começar Gratuitamente
          </Button>
        </div>

        <div className="mt-16 pt-8 border-t border-app-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-app-blue-500 rounded-full">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-app-blue-400">Nutri</span>
                <span className="text-app-green-400">Match</span>
              </span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-app-gray-400 mb-2">Transformando vidas através da nutrição inteligente.</p>
              <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm text-app-gray-400">
                <a href="#" className="hover:text-app-blue-400">Política de Privacidade</a>
                <a href="#" className="hover:text-app-blue-400">Termos de Uso</a>
                <a href="#" className="hover:text-app-blue-400">Contato</a>
                <a href="#" className="hover:text-app-blue-400">Suporte</a>
              </div>
              <p className="text-xs text-app-gray-500 mt-4">
                © 2024 NutriMatch. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
