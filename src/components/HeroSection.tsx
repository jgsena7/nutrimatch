
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-app-blue-50 via-white to-app-green-50 min-h-screen">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-app-gray-900">
                Transforme sua 
                <span className="text-app-blue-600"> nutrição</span> com 
                <span className="text-app-green-600"> inteligência</span>
              </h1>
              <p className="text-xl text-app-gray-600 leading-relaxed max-w-lg">
                Descubra o poder da alimentação personalizada com análises nutricionais inteligentes e recomendações baseadas no seu perfil único.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-app-green-500" />
                <span className="text-app-gray-700 text-lg">Análise nutricional completa</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-app-green-500" />
                <span className="text-app-gray-700 text-lg">Recomendações personalizadas</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-app-green-500" />
                <span className="text-app-gray-700 text-lg">Acompanhamento em tempo real</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-app-blue-600 hover:bg-app-blue-700 text-white text-lg px-8 py-4 rounded-lg"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-app-gray-300 text-app-gray-700 hover:bg-app-gray-50 text-lg px-8 py-4 rounded-lg"
              >
                Saiba Mais
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 bg-white rounded-3xl p-8 shadow-xl border border-app-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=400&fit=crop&crop=center" 
                alt="Alimentação saudável e balanceada" 
                className="w-full h-80 object-cover rounded-2xl mb-6"
              />
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-app-gray-900">
                  Sua jornada nutricional personalizada
                </h3>
                <p className="text-app-gray-600 leading-relaxed">
                  Com nossa tecnologia avançada, você terá acesso a análises detalhadas e recomendações que se adaptam ao seu estilo de vida e objetivos.
                </p>
                <div className="flex items-center justify-between pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-app-blue-600">1000+</div>
                    <div className="text-sm text-app-gray-500">Usuários ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-app-green-600">95%</div>
                    <div className="text-sm text-app-gray-500">Satisfação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-app-blue-600">24/7</div>
                    <div className="text-sm text-app-gray-500">Suporte</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-app-blue-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-app-green-200 rounded-full opacity-60"></div>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-app-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-app-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-app-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-app-gray-900 mb-4">Comunidade Ativa</h3>
            <p className="text-app-gray-600 leading-relaxed">
              Conecte-se com outros usuários, compartilhe experiências e receba apoio em sua jornada nutricional.
            </p>
          </div>

          <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-app-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-app-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-app-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-app-gray-900 mb-4">Resultados Comprovados</h3>
            <p className="text-app-gray-600 leading-relaxed">
              Baseado em ciência nutricional e dados reais, oferecemos estratégias que realmente funcionam.
            </p>
          </div>

          <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-app-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-app-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-app-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-app-gray-900 mb-4">Fácil de Usar</h3>
            <p className="text-app-gray-600 leading-relaxed">
              Interface intuitiva e simples que torna o cuidado com a nutrição uma tarefa prazerosa e eficiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
