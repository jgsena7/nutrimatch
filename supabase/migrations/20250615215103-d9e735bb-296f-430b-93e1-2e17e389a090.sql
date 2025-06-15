
ALTER TABLE public.user_meal_plans
ADD CONSTRAINT user_meal_plans_user_id_plan_date_unique UNIQUE (user_id, plan_date);
