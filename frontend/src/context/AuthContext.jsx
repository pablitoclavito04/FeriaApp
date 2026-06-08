import { useState } from 'react';
import { AuthContext } from './AuthContextDef';
import authService from '../services/authService';

// Authentication provider: holds the logged-in user and exposes login,
// register and logout. The session (token + user) is persisted in
// sessionStorage so it survives reloads but clears when the browser closes.
export const AuthProvider = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const savedUser = sessionStorage.getItem('user');

  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  // The session is read synchronously from sessionStorage above, so there is
  // nothing async to wait for: loading is always false. (It was previously
  // initialised to !token, which left it stuck true for logged-out visitors,
  // hanging PrivateRoute on "Loading…" forever.)
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    setLoading(false);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
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
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};