-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor to fix the issue

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Cashiers can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Managers can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view transaction items" ON public.transaction_items;
DROP POLICY IF EXISTS "Users can manage transaction items" ON public.transaction_items;

-- Create new simplified policies without recursion

-- Profiles policies
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Enable read access for all users" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Transactions policies
CREATE POLICY "Enable read access for all authenticated users" ON public.transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.transactions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Transaction Items policies
CREATE POLICY "Enable read access for all authenticated users" ON public.transaction_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.transaction_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.transaction_items
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Temporary: Disable RLS for debugging (remove this later when auth is working)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items DISABLE ROW LEVEL SECURITY;
