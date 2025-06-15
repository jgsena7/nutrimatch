
-- Adicionar políticas RLS para a tabela nutritional_profiles
ALTER TABLE public.nutritional_profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem apenas seu próprio perfil
CREATE POLICY "Users can view their own nutritional profile" 
  ON public.nutritional_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários inserirem seu próprio perfil
CREATE POLICY "Users can insert their own nutritional profile" 
  ON public.nutritional_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update their own nutritional profile" 
  ON public.nutritional_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para usuários deletarem seu próprio perfil
CREATE POLICY "Users can delete their own nutritional profile" 
  ON public.nutritional_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);
