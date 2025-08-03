-- Supabase Database Schema for POS Kasir
-- Run this in Supabase SQL Editor

-- Create Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'cashier', 'manager')) DEFAULT 'cashier',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create Products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid >= total),
  change_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'completed',
  cashier_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Transaction Items table
CREATE TABLE public.transaction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL, -- Store name in case product is deleted
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_transactions_cashier ON public.transactions(cashier_id);
CREATE INDEX idx_transactions_date ON public.transactions(created_at);
CREATE INDEX idx_transaction_items_transaction ON public.transaction_items(transaction_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security Policies

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Transactions policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.transactions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Transaction Items policies
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.transaction_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.transaction_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.transaction_items
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert sample data
-- Note: For profiles, you'll need to create users through Supabase Auth first
-- Then manually insert profiles or use a trigger

-- Sample products
INSERT INTO public.products (name, category, price, image_url, description) VALUES
  ('Espresso', 'Kopi', 22000, 'https://images.unsplash.com/photo-1579954115545-195abc1b5818?w=300', 'Kopi hitam pekat dengan rasa kuat'),
  ('Latte', 'Kopi', 28000, 'https://images.unsplash.com/photo-1557899911-ea0a41e4a5d3?w=300', 'Kopi dengan susu steamed milk'),
  ('Cappuccino', 'Kopi', 28000, 'https://images.unsplash.com/photo-1557099222-13c53565155f?w=300', 'Kopi dengan foam susu tebal'),
  ('Americano', 'Kopi', 25000, 'https://images.unsplash.com/photo-1521302200778-33500795e128?w=300', 'Espresso dengan air panas'),
  ('Croissant', 'Pastry', 25000, 'https://images.unsplash.com/photo-1621939512535-0c01b9a9758a?w=300', 'Pastry berlapis mentega'),
  ('Pain au Chocolat', 'Pastry', 27000, 'https://images.unsplash.com/photo-1608639024328-791771113a6e?w=300', 'Pastry dengan cokelat'),
  ('Donat Gula', 'Pastry', 18000, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300', 'Donat dengan taburan gula'),
  ('Sandwich Club', 'Makanan', 35000, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300', 'Sandwich dengan ayam dan sayuran'),
  ('Mineral Water', 'Minuman', 15000, 'https://images.unsplash.com/photo-1588704487283-a28185567336?w=300', 'Air mineral kemasan'),
  ('Orange Juice', 'Minuman', 20000, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300', 'Jus jeruk segar');

-- Create views for easier querying
CREATE VIEW public.transaction_summary AS
SELECT 
  t.id,
  t.total,
  t.amount_paid,
  t.change_amount,
  t.created_at,
  p.username as cashier_name,
  COUNT(ti.id) as item_count
FROM public.transactions t
LEFT JOIN public.profiles p ON t.cashier_id = p.id
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
GROUP BY t.id, t.total, t.amount_paid, t.change_amount, t.created_at, p.username;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
