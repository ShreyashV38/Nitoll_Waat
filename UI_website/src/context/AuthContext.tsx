import React, { createContext, useContext, useState, useEffect } from 'react';
import { areaAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  area_id: string;
}

interface Area {
  id: string;
  area_name: string;
  taluka: string;
  district: string;
}

interface AuthContextType {
  user: User | null;
  area: Area | null; // <--- Store Area Info Globally
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [area, setArea] = useState<Area | null>(null); // <--- New State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        fetchAreaInfo(parsedUser.area_id);
      } catch {
        // Corrupted data — clear auth and start fresh
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const fetchAreaInfo = async (areaId: string) => {
    try {
      const res = await areaAPI.getById(areaId);
      setArea(res.data);
    } catch (err) {
      console.error("Failed to fetch area info", err);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchAreaInfo(newUser.area_id); // Fetch area on login
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setArea(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, area, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);