
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';

interface ProgressData {
  date: string;
  weight: number;
  bmi: number;
  calories: number;
  targetCalories: number;
  adherence: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const ProgressReports: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [activeTab, setActiveTab] = useState('evolution');

  // Dados de exemplo - substituir por dados reais do Supabase
  useEffect(() => {
    const mockData: ProgressData[] = [
      { date: '2024-01-01', weight: 75, bmi: 24.5, calories: 2100, targetCalories: 2200, adherence: 85, protein: 120, carbs: 250, fat: 80 },
      { date: '2024-01-08', weight: 74.5, bmi: 24.3, calories: 2150, targetCalories: 2200, adherence: 90, protein: 125, carbs: 245, fat: 75 },
      { date: '2024-01-15', weight: 74, bmi: 24.1, calories: 2180, targetCalories: 2200, adherence: 88, protein: 130, carbs: 240, fat: 78 },
      { date: '2024-01-22', weight: 73.5, bmi: 23.9, calories: 2200, targetCalories: 2200, adherence: 95, protein: 135, carbs: 235, fat: 82 },
      { date: '2024-01-29', weight: 73, bmi: 23.7, calories: 2220, targetCalories: 2200, adherence: 92, protein: 140, carbs: 230, fat: 85 },
    ];
    setProgressData(mockData);
  }, []);

  // Dados seguros com fallbacks para evitar erros
  const currentData = progressData[progressData.length - 1] || {
    weight: 0, bmi: 0, calories: 0, targetCalories: 0, adherence: 0, protein: 0, carbs: 0, fat: 0
  };
  const previousData = progressData[progressData.length - 2] || {
    weight: 0, bmi: 0, calories: 0, targetCalories: 0, adherence: 0, protein: 0, carbs: 0, fat: 0
  };

  const weightChange = currentData.weight - previousData.weight;
  const adherenceAvg = progressData.length > 0 
    ? progressData.reduce((sum, data) => sum + data.adherence, 0) / progressData.length 
    : 0;

  const nutritionData = [
    { name: 'Proteínas', value: currentData.protein, color: '#8884d8' },
    { name: 'Carboidratos', value: currentData.carbs, color: '#82ca9d' },
    { name: 'Gorduras', value: currentData.fat, color: '#ffc658' }
  ];

  const averageCalories = progressData.length > 0 
    ? Math.round(progressData.reduce((sum, data) => sum + data.calories, 0) / progressData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Mudança de Peso</p>
                <p className="text-2xl font-bold">
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </p>
                <Badge variant={weightChange < 0 ? 'default' : 'secondary'}>
                  {weightChange < 0 ? 'Perdendo' : 'Ganhando'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">IMC Atual</p>
                <p className="text-2xl font-bold">{currentData.bmi.toFixed(1)}</p>
                <Badge variant="outline">Normal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Aderência Média</p>
                <p className="text-2xl font-bold">{adherenceAvg.toFixed(0)}%</p>
                <Badge variant={adherenceAvg > 85 ? 'default' : 'secondary'}>
                  {adherenceAvg > 85 ? 'Excelente' : 'Bom'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Calorias Média</p>
                <p className="text-2xl font-bold">{averageCalories}</p>
                <Badge variant="outline">kcal/dia</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Gráficos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="calories">Calorias</TabsTrigger>
          <TabsTrigger value="adherence">Aderência</TabsTrigger>
          <TabsTrigger value="nutrients">Nutrientes</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Peso e IMC</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="weight" orientation="left" />
                  <YAxis yAxisId="bmi" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="weight"
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    name="Peso (kg)"
                  />
                  <Line 
                    yAxisId="bmi"
                    type="monotone" 
                    dataKey="bmi" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    name="IMC"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calories">
          <Card>
            <CardHeader>
              <CardTitle>Consumo Calórico vs Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calories" fill="#8884d8" name="Consumido" />
                  <Bar dataKey="targetCalories" fill="#82ca9d" name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adherence">
          <Card>
            <CardHeader>
              <CardTitle>Percentual de Aderência ao Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="adherence" 
                    stroke="#ffc658" 
                    strokeWidth={3}
                    name="Aderência (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrients">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição Atual de Macronutrientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={nutritionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {nutritionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Macronutrientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="protein" stroke="#8884d8" name="Proteínas (g)" />
                    <Line type="monotone" dataKey="carbs" stroke="#82ca9d" name="Carboidratos (g)" />
                    <Line type="monotone" dataKey="fat" stroke="#ffc658" name="Gorduras (g)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
