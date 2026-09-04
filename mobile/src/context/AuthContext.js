import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../api/services';
import { initApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true); // true while we restore a saved session

  // On app launch: load the server URL and any saved login.
  useEffect(() => {
    (async () => {
      try {
        await initApi();
        const [token, savedUser] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user'),
        ]);
        if (token && savedUser) setUser(JSON.parse(savedUser));
      } catch (e) {
        // ignore — user just lands on the login screen
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const persist = async (token, u) => {
    await AsyncStorage.multiSet([['token', token], ['user', JSON.stringify(u)]]);
    setUser(u);
  };

  const login = async (email, password) => {
    const { token, user: u } = await AuthAPI.login(email, password);
    await persist(token, u);
  };

  const register = async (payload) => {
    const { token, user: u } = await AuthAPI.register(payload);
    await persist(token, u);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
