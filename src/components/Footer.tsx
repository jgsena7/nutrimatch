
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-nutri-blue-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold">
            Venha conosco para uma vida melhor!
          </h2>
          <h3 className="text-xl text-blue-200">
            Invista no seu futuro
          </h3>
          <Button 
            size="lg"
            className="bg-nutri-green-500 hover:bg-nutri-green-600 text-white px-8 py-6 text-lg rounded-full"
          >
            Associar-se
          </Button>
        </div>

        <div className="mt-16 pt-8 border-t border-blue-700">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                <Heart className="w-5 h-5 text-nutri-blue-600" fill="currentColor" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-blue-300">Nutri</span>
                <span className="text-nutri-green-400">Match</span>
              </span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-blue-200 mb-2">Sua dieta, do seu jeito.</p>
              <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm text-blue-300">
                <a href="#" className="hover:text-nutri-green-400">Política</a>
                <a href="#" className="hover:text-nutri-green-400">Privacidade</a>
                <a href="#" className="hover:text-nutri-green-400">Condições</a>
                <a href="#" className="hover:text-nutri-green-400">Info</a>
                <a href="#" className="hover:text-nutri-green-400">Feedback</a>
              </div>
              <p className="text-xs text-blue-400 mt-4">
                © 2024 NutriMatch. Todos os direitos reservados.
                <br />
                2025/2024-1234
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
