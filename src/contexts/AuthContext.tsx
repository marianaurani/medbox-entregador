// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextData, User, SignUpData } from '../types';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USER_STORAGE_KEY = '@MedBoxDelivery:user';
const TEMP_SIGNUP_KEY = '@MedBoxDelivery:temp_signup';
const CREDENTIALS_KEY = '@MedBoxDelivery:credentials';

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

  // Salva credenciais (email + senha)
  const saveCredentials = async (email: string, password: string) => {
    try {
      const credentials = { email, password };
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  };

  // Busca credenciais salvas
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

  // SignUp agora apenas salva dados temporários
  const signUp = async (data: SignUpData) => {
    try {
      // Validações básicas apenas
      if (!data.name?.trim()) throw new Error('Nome é obrigatório');
      if (!data.cpf?.trim()) throw new Error('CPF é obrigatório');
      if (!data.phone?.trim()) throw new Error('Telefone é obrigatório');
      if (!data.email?.trim()) throw new Error('E-mail é obrigatório');

      // Salva temporariamente (NÃO cria usuário ainda)
      await saveTempSignupData(data);
      
    } catch (error) {
      throw error;
    }
  };

  // Completa o cadastro (chamado no RegistrationComplete)
  const completeSignUp = async () => {
    try {
      const tempData = await getTempSignupData();
      if (!tempData) {
        console.log('Usuário já autenticado');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: tempData.name.trim(),
        email: tempData.email?.trim() || '',
        cpf: tempData.cpf.trim(),
        phone: tempData.phone.trim(),
        status: 'pendente_aprovacao',
        registrationStatus: 'pendente',
      };

      // Salva as credenciais (email + senha do cadastro)
      if (tempData.password) {
        await saveCredentials(tempData.email || '', tempData.password);
      }

      await saveUser(newUser);
      await clearTempSignupData();
      
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
      throw error;
    }
  };

// SignIn com email e senha
const signIn = async (email: string, password: string) => {
  try {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!email?.trim()) throw new Error('E-mail é obrigatório');
    if (!password?.trim()) throw new Error('Senha é obrigatória');

    // ✅ SIMPLIFICADO - Aceita qualquer login (útil para desenvolvimento sem back-end)
    const storedCredentials = await getStoredCredentials();
    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    
    // Se já existe um usuário salvo, usa ele
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Atualiza as credenciais com o novo login
      await saveCredentials(email, password);
      return;
    }

    // Se não existe usuário, cria um novo
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
  

  // ✅ NOVA FUNÇÃO - Redefine a senha
  const resetPassword = async (email: string, newPassword: string) => {
    try {
      const credentials = await getStoredCredentials();
      
      if (!credentials || credentials.email !== email) {
        throw new Error('Usuário não encontrado');
      }

      // Atualiza a senha
      await saveCredentials(email, newPassword);
      
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      // NÃO remove credenciais no logout, para poder fazer login novamente
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
        getTempSignupData,
        getStoredCredentials, // ✅ EXPÕE
        resetPassword, // ✅ EXPÕE
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