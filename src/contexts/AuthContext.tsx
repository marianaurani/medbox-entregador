// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextData, User, SignUpData } from '../types';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USER_STORAGE_KEY = '@MedBoxDelivery:user';
const TEMP_SIGNUP_KEY = '@MedBoxDelivery:temp_signup';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw new Error('Não foi possível salvar os dados');
    }
  };

  // Salva dados temporários durante o cadastro
  const saveTempSignupData = async (data: SignUpData) => {
    try {
      await AsyncStorage.setItem(TEMP_SIGNUP_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados temporários:', error);
    }
  };

  // Pega dados temporários
  const getTempSignupData = async (): Promise<SignUpData | null> => {
    try {
      const data = await AsyncStorage.getItem(TEMP_SIGNUP_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao buscar dados temporários:', error);
      return null;
    }
  };

  // Remove dados temporários
  const clearTempSignupData = async () => {
    try {
      await AsyncStorage.removeItem(TEMP_SIGNUP_KEY);
    } catch (error) {
      console.error('Erro ao limpar dados temporários:', error);
    }
  };

  // Agora signUp só salva temporariamente
  const signUp = async (data: SignUpData) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!data.name?.trim()) throw new Error('Nome é obrigatório');
      if (!data.cpf?.trim()) throw new Error('CPF é obrigatório');
      if (!data.phone?.trim()) throw new Error('Telefone é obrigatório');

      // Salva temporariamente (NÃO cria usuário ainda)
      await saveTempSignupData(data);
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Completa o cadastro (chamado no RegistrationComplete)
  const completeSignUp = async () => {
    try {
      const tempData = await getTempSignupData();
      if (!tempData) throw new Error('Dados de cadastro não encontrados');

      const newUser: User = {
        id: Date.now().toString(),
        name: tempData.name.trim(),
        email: tempData.email?.trim() || '',
        cpf: tempData.cpf.trim(),
        phone: tempData.phone.trim(),
        status: 'pendente_aprovacao',
        registrationStatus: 'pendente',
      };

      await saveUser(newUser);
      await clearTempSignupData();
      
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (cpf: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!cpf?.trim()) throw new Error('CPF é obrigatório');

      const mockUser: User = {
        id: Date.now().toString(),
        name: 'Entregador',
        email: '',
        cpf: cpf.trim(),
        phone: '',
        status: 'indisponivel',
        registrationStatus: 'aprovado',
      };

      await saveUser(mockUser);
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error('Não foi possível sair da conta');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: User['status']) => {
    try {
      if (!user) return;
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedUser = { ...user, status };
      await saveUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) return;
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedUser = { ...user, ...data };
      await saveUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        updateStatus,
        updateProfile,
        completeSignUp, // NOVO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};