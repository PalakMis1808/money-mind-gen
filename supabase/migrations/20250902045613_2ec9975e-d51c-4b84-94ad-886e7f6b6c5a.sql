-- Add unique constraint to prevent duplicate budgets per user per month
ALTER TABLE public.budgets 
ADD CONSTRAINT budgets_user_id_month_key UNIQUE (user_id, month);