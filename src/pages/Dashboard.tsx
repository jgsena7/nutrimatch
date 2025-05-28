
import React from 'react';
import Header from '@/components/Header';
import NutritionalProfile from '@/components/NutritionalProfile';
import NutritionAnalysis from '@/components/NutritionAnalysis';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-app-blue-50 via-white to-app-green-50">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-app-gray-900 mb-4">
            Seu Dashboard <span className="text-app-blue-600">Nutricional</span>
          </h1>
          <p className="text-xl text-app-gray-600">
            Gerencie seu perfil e acompanhe suas análises nutricionais
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-sm border border-app-gray-200">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-app-blue-500 data-[state=active]:text-white text-app-gray-700 py-3"
            >
              Perfil Nutricional
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className="data-[state=active]:bg-app-green-500 data-[state=active]:text-white text-app-gray-700 py-3"
            >
              Análise Nutricional
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <NutritionalProfile />
          </TabsContent>
          
          <TabsContent value="analysis">
            <NutritionAnalysis />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
