// ============================================
//  src/store/authStore.js
// ============================================
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // State
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Actions
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ 
      user, 
      token, 
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
  
  // Update user info (for profile updates)
  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
  
  // Check if token is still valid
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      set({ 
        token, 
        user: JSON.parse(user), 
        isAuthenticated: true 
      });
      return true;
    } else {
      set({ 
        token: null, 
        user: null, 
        isAuthenticated: false 
      });
      return false;
    }
  }
}));