import { CONFIG, STORAGE_KEYS, USER_ROLES, ERROR_MESSAGES } from './constants';

// Login user
export const loginUser = async (username, password) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, this would be an API call
    if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
      const userData = {
        id: 1,
        username: username,
        role: USER_ROLES.ADMIN,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };

      // Store user data
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());

      return { success: true, user: userData };
    } else {
      return { success: false, error: ERROR_MESSAGES.INVALID_CREDENTIALS };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: ERROR_MESSAGES.NETWORK_ERROR };
  }
};

// Get current user
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    const sessionTimestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);

    if (!userData || !sessionTimestamp) {
      return null;
    }

    // Check session timeout
    const now = Date.now();
    const sessionStart = parseInt(sessionTimestamp);
    if (now - sessionStart > CONFIG.SESSION_TIMEOUT) {
      logoutUser();
      return null;
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user && user.isLoggedIn;
};

// Check user role
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
};
