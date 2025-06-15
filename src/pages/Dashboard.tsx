
import React from 'react';
import Header from '@/components/Header';
import NutritionalProfile from '@/components/NutritionalProfile';
import NutritionAnalysis from '@/components/NutritionAnalysis';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nutri-dark-900 via-nutri-dark-800 to-nutri-green-900">
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-32">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="profile" className="data-[state=active]:bg-nutri-green-500 data-[state=active]:text-white text-white">
              Perfil Nutricional
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-nutri-green-500 data-[state=active]:text-white text-white">
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
