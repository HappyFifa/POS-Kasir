// Configuration constants
export const CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'POS Pro',
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000, // 1 hour default
  ADMIN_USERNAME: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

// Storage keys
export const STORAGE_KEYS = {
  USER: 'pos_user',
  PRODUCTS: 'pos_products',
  TRANSACTIONS: 'pos_transactions',
  SESSION_TIMESTAMP: 'pos_session_timestamp',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  MANAGER: 'manager',
};

// Transaction status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Product categories
export const PRODUCT_CATEGORIES = [
  'Kopi',
  'Non-Kopi',
  'Pastry',
  'Makanan',
  'Minuman Dingin',
  'Snack',
];

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  DIGITAL: 'digital',
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Username atau password salah',
  SESSION_EXPIRED: 'Sesi telah berakhir, silakan login kembali',
  REQUIRED_FIELDS: 'Semua field harus diisi',
  INVALID_AMOUNT: 'Jumlah tidak valid',
  INSUFFICIENT_PAYMENT: 'Uang yang dibayarkan kurang',
  NETWORK_ERROR: 'Terjadi kesalahan jaringan',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
};
