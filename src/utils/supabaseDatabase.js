// Supabase Database Implementation for POS Kasir
// Replace localStorage with real database

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Error handling utility
const handleError = (error, operation) => {
  console.error(`Database error in ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message}`);
};

// ==========================================
// AUTHENTICATION
// ==========================================

export const authService = {
  // Sign in with email/password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign up new user
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: userData.username,
          full_name: userData.full_name,
          role: userData.role || 'cashier'
        });
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        // Get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        return { ...user, profile };
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Listen to auth changes
  onAuthStateChanged(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

// ==========================================
// PRODUCTS
// ==========================================

export const productService = {
  // Get all products
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform image_url to image for frontend compatibility
      const transformedData = (data || []).map(product => ({
        ...product,
        image: product.image_url
      }));
      
      return transformedData;
    } catch (error) {
      handleError(error, 'Get products');
    }
  },

  // Add new product
  async add(product) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          category: product.category,
          price: product.price,
          image_url: product.image,
          description: product.description,
          stock: product.stock || 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform image_url to image for frontend compatibility
      const transformedData = {
        ...data,
        image: data.image_url
      };
      
      return transformedData;
    } catch (error) {
      handleError(error, 'Add product');
    }
  },

  // Update product
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          category: updates.category,
          price: updates.price,
          image_url: updates.image,
          description: updates.description,
          stock: updates.stock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform image_url to image for frontend compatibility
      const transformedData = {
        ...data,
        image: data.image_url
      };
      
      return transformedData;
    } catch (error) {
      handleError(error, 'Update product');
    }
  },

  // Delete product (soft delete)
  async delete(id) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error, 'Delete product');
    }
  },

  // Find product by ID
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
        
      if (error) throw error;
      
      // Transform image_url to image for frontend compatibility
      if (data) {
        return {
          ...data,
          image: data.image_url
        };
      }
      
      return data;
    } catch (error) {
      console.error('Find product error:', error);
      return null;
    }
  },

  // Subscribe to product changes
  subscribeToChanges(callback) {
    return supabase
      .channel('products-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, callback)
      .subscribe();
  }
};

// ==========================================
// TRANSACTIONS
// ==========================================

export const transactionService = {
  // Get all transactions
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            id,
            product_name,
            product_price,
            quantity,
            subtotal
          ),
          profiles:cashier_id (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data structure for frontend compatibility
      const transformedData = (data || []).map(transaction => ({
        ...transaction,
        // Map transaction_items to items for dashboard compatibility
        items: transaction.transaction_items || [],
        // Transform timestamp to match expected format
        timestamp: transaction.created_at
      }));
      
      return transformedData;
    } catch (error) {
      handleError(error, 'Get transactions');
    }
  },

  // Get today's transactions
  async getTodaysTransactions() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            id,
            product_name,
            product_price,
            quantity,
            subtotal
          )
        `)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data structure for frontend compatibility
      const transformedData = (data || []).map(transaction => ({
        ...transaction,
        // Map transaction_items to items for dashboard compatibility
        items: transaction.transaction_items || [],
        // Transform timestamp to match expected format
        timestamp: transaction.created_at
      }));
      
      return transformedData;
    } catch (error) {
      handleError(error, 'Get today transactions');
    }
  },

  // Add new transaction
  async add(transaction) {
    try {
      // Start transaction without cashier_id for now (making it nullable)
      // This avoids foreign key constraint issues with the current auth system
      const { data: newTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          total: transaction.total,
          amount_paid: transaction.amountPaid,
          change_amount: transaction.change,
          // cashier_id: null, // Skip this field for now
          notes: transaction.notes || ''
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Add transaction items
      const transactionItems = transaction.items.map(item => ({
        transaction_id: newTransaction.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      return newTransaction;
    } catch (error) {
      handleError(error, 'Add transaction');
    }
  },

  // Get transactions by date range
  async getByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            id,
            product_name,
            product_price,
            quantity,
            subtotal
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get transactions by date range');
    }
  },

  // Subscribe to transaction changes
  subscribeToChanges(callback) {
    return supabase
      .channel('transactions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, callback)
      .subscribe();
  }
};

// ==========================================
// ANALYTICS & REPORTS
// ==========================================

export const analyticsService = {
  // Get sales summary
  async getSalesSummary(period = 'today') {
    try {
      let startDate;
      const now = new Date();

      switch (period) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('total, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const totalSales = data.reduce((sum, t) => sum + parseFloat(t.total), 0);
      const transactionCount = data.length;
      const averageTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

      return {
        totalSales,
        transactionCount,
        averageTransaction,
        period
      };
    } catch (error) {
      handleError(error, 'Get sales summary');
    }
  },

  // Get weekly sales data for charts
  async getWeeklySalesData() {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

      const { data, error } = await supabase
        .from('transactions')
        .select('total, created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      // Group by day
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const salesByDay = new Array(7).fill(0);

      data.forEach(transaction => {
        const date = new Date(transaction.created_at);
        const dayIndex = date.getDay();
        salesByDay[dayIndex] += parseFloat(transaction.total);
      });

      return dayNames.map((day, index) => ({
        name: day,
        Penjualan: salesByDay[index]
      }));
    } catch (error) {
      handleError(error, 'Get weekly sales data');
    }
  }
};

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

export const realtimeService = {
  // Subscribe to all changes
  subscribeToAll(callbacks) {
    const channels = [];

    // Products subscription
    if (callbacks.onProductChange) {
      const productChannel = supabase
        .channel('products-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products'
        }, callbacks.onProductChange)
        .subscribe();
      channels.push(productChannel);
    }

    // Transactions subscription
    if (callbacks.onTransactionChange) {
      const transactionChannel = supabase
        .channel('transactions-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transactions'
        }, callbacks.onTransactionChange)
        .subscribe();
      channels.push(transactionChannel);
    }

    return channels;
  },

  // Unsubscribe from channels
  unsubscribe(channels) {
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
  }
};

export default supabase;
