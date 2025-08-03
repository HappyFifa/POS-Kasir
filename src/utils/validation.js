import { ERROR_MESSAGES } from './constants';

// Validation rules
export const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'Field ini wajib diisi';
    }
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Format email tidak valid';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Minimal ${min} karakter`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Maksimal ${max} karakter`;
    }
    return null;
  },

  number: (value) => {
    if (value && isNaN(Number(value))) {
      return 'Harus berupa angka';
    }
    return null;
  },

  positiveNumber: (value) => {
    const num = Number(value);
    if (value && (isNaN(num) || num <= 0)) {
      return 'Harus berupa angka positif';
    }
    return null;
  },

  price: (value) => {
    const num = Number(value);
    if (value && (isNaN(num) || num < 0)) {
      return 'Harga tidak valid';
    }
    return null;
  },

  phone: (value) => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (value && !phoneRegex.test(value.replace(/[\s-]/g, ''))) {
      return 'Format nomor telepon tidak valid';
    }
    return null;
  },
};

// Validate single field
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) {
      return error;
    }
  }
  return null;
};

// Validate entire form
export const validateForm = (data, validationSchema) => {
  const errors = {};
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(validationSchema)) {
    const fieldValue = data[fieldName];
    const fieldError = validateField(fieldValue, rules);
    
    if (fieldError) {
      errors[fieldName] = fieldError;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Product validation schema
export const productValidationSchema = {
  name: [validationRules.required, validationRules.maxLength(100)],
  price: [validationRules.required, validationRules.price],
  category: [validationRules.required],
};

// Login validation schema
export const loginValidationSchema = {
  username: [validationRules.required, validationRules.minLength(3)],
  password: [validationRules.required, validationRules.minLength(6)],
};

// Payment validation
export const validatePayment = (totalAmount, paidAmount) => {
  const total = Number(totalAmount);
  const paid = Number(paidAmount);

  if (isNaN(paid) || paid <= 0) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_AMOUNT };
  }

  if (paid < total) {
    return { isValid: false, error: ERROR_MESSAGES.INSUFFICIENT_PAYMENT };
  }

  return { isValid: true, change: paid - total };
};

// File validation
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Format file harus JPG, PNG, atau WebP' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'Ukuran file maksimal 5MB' };
  }

  return { isValid: true };
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
};
