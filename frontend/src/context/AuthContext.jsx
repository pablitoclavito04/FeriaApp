import { useState } from 'react';
import { AuthContext } from './AuthContextDef';
import authService from '../services/authService';

export const AuthProvider = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const savedUser = sessionStorage.getItem('user');

  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [loading, setLoading] = useState(!token);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    setLoading(false);
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};