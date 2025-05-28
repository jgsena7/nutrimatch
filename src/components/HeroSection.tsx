
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Apple, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900 min-h-screen flex items-center">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Bem-vindo ao <span className="text-nutri-green-400">NutriMatch</span>
            </h1>
            <h2 className="text-2xl lg:text-3xl font-light text-nutri-green-200">
              Sua dieta, do seu jeito.
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
              Esta coleção de outros grandiosos pontos sua paixão a descobrir em refeições. 
              Descubra uma nova forma de comer com o NutriMatch que entende você.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-nutri-green-500 hover:bg-nutri-green-600 text-white text-lg px-8 py-6 rounded-full"
            >
              Saiba Mais
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="relative">
            <div className="relative z-10 bg-white rounded-3xl p-8 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&crop=center" 
                alt="Prato saudável com diversos alimentos" 
                className="w-full h-64 object-cover rounded-2xl mb-6"
              />
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-nutri-dark-900">
                  Planejamento alimentar personalizado.
                </h3>
                <p className="text-gray-600">
                  Tudo isso em uma única interface simples, intuitiva e acessível, para 
                  que qualquer pessoa possa viver com mais praticidade e segurança.
                </p>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-nutri-green-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-nutri-green-600 rounded-full opacity-30"></div>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center text-white space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-nutri-green-500 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Orientação personalizada</h3>
            <p className="text-gray-300">
              Descubra receitas únicas criadas para seus objetivos de nutrição 
              em sua jornada da boa alimentação.
            </p>
          </div>

          <div className="text-center text-white space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-nutri-green-500 rounded-full flex items-center justify-center">
                <Apple className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Nutrição inteligente</h3>
            <p className="text-gray-300">
              Análise de toda análise de nutrição da sua comida, por aí ficaremos. 
              Faça nossa análise que te oferece uma alimentação.
            </p>
          </div>

          <div className="text-center text-white space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-nutri-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Acompanhe suas metas</h3>
            <p className="text-gray-300">
              Acompanhe tudo o que você come, monitore suas metas 
              em tempo real para uma vida ainda melhor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
