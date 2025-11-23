// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextData, User, SignUpData } from '../types';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USER_STORAGE_KEY = '@MedBoxDelivery:user';
const TEMP_SIGNUP_KEY = '@MedBoxDelivery:temp_signup';
const CREDENTIALS_KEY = '@MedBoxDelivery:credentials'; // ✅ NOVO - Armazena credenciais

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

  // ✅ NOVA FUNÇÃO - Salva credenciais (email + senha)
  const saveCredentials = async (email: string, password: string) => {
    try {
      const credentials = { email, password };
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  };

  // ✅ NOVA FUNÇÃO - Busca credenciais salvas
  const getStoredCredentials = async (): Promise<{ email: string; password: string } | null> => {
    try {
      const data = await AsyncStorage.getItem(CREDENTIALS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao buscar credenciais:', error);
      return null;
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
      if (!data.email?.trim()) throw new Error('E-mail é obrigatório');

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

      // ✅ SALVA AS CREDENCIAIS (email + senha do cadastro)
      if (tempData.password) {
        await saveCredentials(tempData.email || '', tempData.password);
      }

      await saveUser(newUser);
      await clearTempSignupData();
      
    } catch (error) {
      throw error;
    }
  };

  // ✅ ATUALIZADO - signIn agora recebe email e senha
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!email?.trim()) throw new Error('E-mail é obrigatório');
      if (!password?.trim()) throw new Error('Senha é obrigatória');

      // ✅ VALIDAÇÃO BÁSICA - Verifica se as credenciais batem
      const storedCredentials = await getStoredCredentials();
      
      if (storedCredentials) {
        // Se existe usuário cadastrado, valida email e senha
        if (storedCredentials.email !== email.trim()) {
          throw new Error('E-mail não encontrado');
        }
        if (storedCredentials.password !== password) {
          throw new Error('Senha incorreta');
        }

        // Se passou na validação, busca o usuário salvo
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }
      }

      // Se não tem usuário cadastrado, cria um temporário (para testes)
      const mockUser: User = {
        id: Date.now().toString(),
        name: 'Entregador Teste',
        email: email.trim(),
        cpf: '000.000.000-00',
        phone: '(00) 00000-0000',
        status: 'indisponivel',
        registrationStatus: 'aprovado',
      };

      await saveUser(mockUser);
      await saveCredentials(email, password);
      
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
      // ✅ NÃO remove credenciais no logout, para poder fazer login novamente
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
        completeSignUp,
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