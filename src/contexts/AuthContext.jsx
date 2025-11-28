import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock user database
const USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Abdur' },
  { id: 2, username: 'user1', password: 'user123', role: 'user', name: 'Dimple' },
  { id: 3, username: 'user2', password: 'user123', role: 'user', name: 'Paul' },
  { id: 4, username: 'user3', password: 'user123', role: 'user', name: 'Ayan' },
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin: currentUser?.role === 'admin',
    isUser: currentUser?.role === 'user',
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
