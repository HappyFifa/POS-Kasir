// Database Adapter - Switch between localStorage and Supabase
// This provides a unified interface for both storage methods

import { STORAGE_KEYS } from './constants';

// Check if we should use Supabase
const useSupabase = import.meta.env.VITE_DATABASE_MODE === 'supabase';

// Import Supabase services only if needed
let supabaseServices = null;
let supabaseInitialized = false;

const initializeSupabase = async () => {
  if (useSupabase && !supabaseInitialized) {
    try {
      const module = await import('./supabaseDatabase.js');
      supabaseServices = module;
      supabaseInitialized = true;
    } catch (error) {
      console.warn('⚠️ Supabase not configured, falling back to localStorage:', error);
      supabaseInitialized = false;
    }
  }
};

// Initialize on first use
let initialized = false;
const ensureInitialized = async () => {
  if (!initialized) {
    if (useSupabase) {
      await initializeSupabase();
    }
    initialized = true;
  }
};

// ==========================================
// LOCALSTORAGE IMPLEMENTATIONS (Fallback)
// ==========================================

// Generic localStorage utility
class LocalStorageManager {
  constructor() {
    this.storage = localStorage;
  }

  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      this.storage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error setting storage item "${key}":`, error);
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting storage item "${key}":`, error);
      return defaultValue;
    }
  }

  removeItem(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing storage item "${key}":`, error);
      return false;
    }
  }

  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

const storageManager = new LocalStorageManager();

// ==========================================
// PRODUCT STORAGE
// ==========================================

const localProductStorage = {
  getAll: () => {
    return storageManager.getItem(STORAGE_KEYS.PRODUCTS, []);
  },

  save: (products) => {
    return storageManager.setItem(STORAGE_KEYS.PRODUCTS, products);
  },

  add: (product) => {
    const products = localProductStorage.getAll();
    const newProduct = {
      ...product,
      id: product.id || Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    localProductStorage.save(products);
    return newProduct;
  },

  update: (id, updates) => {
    const products = localProductStorage.getAll();
    const index = products.findIndex(p => p.id === id);
    
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localProductStorage.save(products);
      return products[index];
    }
    return null;
  },

  delete: (id) => {
    const products = localProductStorage.getAll();
    const filteredProducts = products.filter(p => p.id !== id);
    localProductStorage.save(filteredProducts);
    return filteredProducts.length < products.length;
  },

  findById: (id) => {
    const products = localProductStorage.getAll();
    return products.find(p => p.id === id) || null;
  },
};

// ==========================================
// TRANSACTION STORAGE
// ==========================================

const localTransactionStorage = {
  getAll: () => {
    return storageManager.getItem(STORAGE_KEYS.TRANSACTIONS, []);
  },

  save: (transactions) => {
    return storageManager.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  add: (transaction) => {
    const transactions = localTransactionStorage.getAll();
    const newTransaction = {
      ...transaction,
      id: transaction.id || Date.now(),
      timestamp: transaction.timestamp || new Date().toISOString(),
    };
    transactions.push(newTransaction);
    localTransactionStorage.save(transactions);
    return newTransaction;
  },

  getTodaysTransactions: () => {
    const transactions = localTransactionStorage.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate >= today;
    });
  },
};

// ==========================================
// UNIFIED DATABASE INTERFACE
// ==========================================

export const productStorage = {
  async getAll() {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.productService.getAll();
    }
    return localProductStorage.getAll();
  },

  async add(product) {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.productService.add(product);
    }
    return localProductStorage.add(product);
  },

  async update(id, updates) {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.productService.update(id, updates);
    }
    return localProductStorage.update(id, updates);
  },

  async delete(id) {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.productService.delete(id);
    }
    return localProductStorage.delete(id);
  },

  async findById(id) {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.productService.findById(id);
    }
    return localProductStorage.findById(id);
  },

  // Subscribe to changes (only available with Supabase)
  subscribeToChanges(callback) {
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return supabaseServices.productService.subscribeToChanges(callback);
    }
    // Return dummy subscription for localStorage
    return { unsubscribe: () => {} };
  }
};

export const transactionStorage = {
  async getAll() {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.transactionService.getAll();
    }
    return localTransactionStorage.getAll();
  },

  async add(transaction) {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.transactionService.add(transaction);
    }
    return localTransactionStorage.add(transaction);
  },

  async getTodaysTransactions() {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.transactionService.getTodaysTransactions();
    }
    return localTransactionStorage.getTodaysTransactions();
  },

  async getByDateRange(startDate, endDate) {
    await ensureInitialized();
    if (useSupabase && supabaseInitialized && supabaseServices) {
      return await supabaseServices.transactionService.getByDateRange(startDate, endDate);
    }
    // Fallback for localStorage
    const transactions = localTransactionStorage.getAll();
    return transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  },

  // Subscribe to changes (only available with Supabase)
  subscribeToChanges(callback) {
    if (useSupabase && supabaseServices) {
      return supabaseServices.transactionService.subscribeToChanges(callback);
    }
    return { unsubscribe: () => {} };
  }
};

// ==========================================
// ANALYTICS SERVICE
// ==========================================

export const analyticsService = {
  async getSalesSummary(period = 'today') {
    if (useSupabase && supabaseServices) {
      return await supabaseServices.analyticsService.getSalesSummary(period);
    }
    
    // Fallback implementation for localStorage
    const transactions = localTransactionStorage.getAll();
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

    const periodTransactions = transactions.filter(t => 
      new Date(t.timestamp) >= startDate
    );

    const totalSales = periodTransactions.reduce((sum, t) => sum + t.total, 0);
    const transactionCount = periodTransactions.length;
    const averageTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

    return {
      totalSales,
      transactionCount,
      averageTransaction,
      period
    };
  },

  async getWeeklySalesData() {
    if (useSupabase && supabaseServices) {
      return await supabaseServices.analyticsService.getWeeklySalesData();
    }

    // Fallback implementation for localStorage
    const transactions = localTransactionStorage.getAll();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const salesByDay = new Array(7).fill(0);

    transactions
      .filter(transaction => new Date(transaction.timestamp) >= sevenDaysAgo)
      .forEach(transaction => {
        const date = new Date(transaction.timestamp);
        const dayIndex = date.getDay();
        salesByDay[dayIndex] += transaction.total;
      });

    return dayNames.map((day, index) => ({
      name: day,
      Penjualan: salesByDay[index]
    }));
  }
};

// ==========================================
// DATABASE INFO
// ==========================================

export const databaseInfo = {
  type: useSupabase ? 'supabase' : 'localStorage',
  isOnline: useSupabase,
  supportsRealtime: useSupabase,
  supportsMultiUser: useSupabase,
  supportsBackup: useSupabase
};

export default {
  productStorage,
  transactionStorage,
  analyticsService,
  databaseInfo
};
