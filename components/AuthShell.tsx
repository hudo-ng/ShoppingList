import React, { useContext, useEffect, useState, ReactNode } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from './AuthContext';
import { jwtDecode } from 'jwt-decode';


interface JwtProp {
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  password: string,
}

interface Props {
  children?: ReactNode
}

export default function AuthShell({ children }: Props) {
  const router = useRouter();
  const { token, setToken } = useContext(AuthContext);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tokenFromStorage = await SecureStore.getItemAsync('token');
        if (tokenFromStorage) {
          setToken(tokenFromStorage);
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, [setToken]);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.replace('/signin');
      return;
    }

    try {
      const decoded: JwtProp = jwtDecode(token);
      setUserName(decoded?.firstName ?? 'User');
    } catch (error) {
      console.error('Invalid token:', error);
      SecureStore.deleteItemAsync('token'); 
      setToken('');
      router.replace('/signin');
    }
  }, [token, loading]);

  // Section E stopped here 

  const handleSignOut = async () => {
    await SecureStore.deleteItemAsync('token');
    setToken('');
    router.replace('/signin');
  };

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  

  return (
    <>
      {children}
    </>
  );
}

