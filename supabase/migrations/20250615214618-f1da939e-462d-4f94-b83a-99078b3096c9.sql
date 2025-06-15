
-- Cria tabela para planos alimentares customizados
CREATE TABLE public.user_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_profile_id uuid NOT NULL,
  plan_date date NOT NULL,
  plan_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS: Habilita row level security
ALTER TABLE public.user_meal_plans ENABLE ROW LEVEL SECURITY;

-- Usuário só pode ver e manipular seus próprios planos
CREATE POLICY "User can access their own meal plans"
  ON public.user_meal_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
