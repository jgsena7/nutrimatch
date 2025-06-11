
-- Criar tabela para armazenar perfis nutricionais
CREATE TABLE public.nutritional_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  height DECIMAL NOT NULL,
  weight DECIMAL NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('feminino', 'masculino', 'outros', 'prefiro-nao-dizer')),
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentario', 'leve', 'moderado', 'intenso')),
  goal TEXT NOT NULL CHECK (goal IN ('emagrecimento', 'ganho-massa', 'manutencao')),
  food_preferences TEXT,
  food_restrictions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.nutritional_profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas para que usuários vejam apenas seus próprios perfis
CREATE POLICY "Users can view their own nutritional profiles" 
  ON public.nutritional_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutritional profiles" 
  ON public.nutritional_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutritional profiles" 
  ON public.nutritional_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutritional profiles" 
  ON public.nutritional_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);
