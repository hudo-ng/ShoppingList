import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";

interface Props {
  children?: ReactNode
}

// 1) Create the context
export const AuthContext = createContext({
  token: '',
  setToken: (tokenFromStorage: string) => {},
});

// 2) Create the provider
export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string>('');

  // Check if a token exists in SecureStore when the app starts
  useEffect(() => {
    (async () => {
      const savedToken = await SecureStore.getItemAsync("token");
      if (savedToken) {
        setToken(savedToken);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
