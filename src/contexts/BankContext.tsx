// src/contexts/BankContext.tsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PixKeyType = 'cpf' | 'phone' | 'email' | 'random';
export type AccountType = 'corrente' | 'poupanca';

export interface PixKey {
  id: string;
  type: PixKeyType;
  key: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface BankAccount {
  bank: string;
  bankCode: string;
  accountType: AccountType;
  agency: string;
  account: string;
  digit: string;
}

interface BankContextData {
  pixKeys: PixKey[];
  defaultPixKey: PixKey | null;
  bankAccount: BankAccount | null;
  addPixKey: (type: PixKeyType, key: string, isDefault?: boolean) => boolean;
  updatePixKey: (id: string, key: string) => boolean;
  deletePixKey: (id: string) => boolean;
  setDefaultPixKey: (id: string) => void;
  getPixKeyById: (id: string) => PixKey | undefined;
  updateBankAccount: (account: BankAccount) => void;
  hasBankAccount: boolean;
  loading: boolean;
}

const BankContext = createContext<BankContextData>({} as BankContextData);

const STORAGE_KEYS = {
  PIX_KEYS: '@entregador:bank:pixkeys',
  BANK_ACCOUNT: '@entregador:bank:account',
};

// Dados mockados iniciais
const mockPixKeys: PixKey[] = [
  {
    id: '1',
    type: 'cpf',
    key: '123.456.789-00',
    isDefault: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    type: 'phone',
    key: '(61) 99999-8888',
    isDefault: false,
    createdAt: new Date('2024-02-20'),
  },
];

const mockBankAccount: BankAccount = {
  bank: 'Banco do Brasil',
  bankCode: '001',
  accountType: 'corrente',
  agency: '1234',
  account: '56789',
  digit: '0',
};

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pixKeys, setPixKeys] = useState<PixKey[]>(mockPixKeys);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(mockBankAccount);
  const [loading, setLoading] = useState(true);

  const defaultPixKey = pixKeys.find(pk => pk.isDefault) || null;
  const hasBankAccount = !!bankAccount;

  // Carregar dados ao iniciar
  useEffect(() => {
    loadBankData();
  }, []);

  const loadBankData = async () => {
    try {
      const [storedPixKeys, storedBankAccount] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PIX_KEYS),
        AsyncStorage.getItem(STORAGE_KEYS.BANK_ACCOUNT),
      ]);

      if (storedPixKeys) {
        const parsedPixKeys = JSON.parse(storedPixKeys);
        // Reconverte as datas
        const pixKeysWithDates = parsedPixKeys.map((pk: any) => ({
          ...pk,
          createdAt: new Date(pk.createdAt),
        }));
        setPixKeys(pixKeysWithDates);
      }

      if (storedBankAccount) {
        setBankAccount(JSON.parse(storedBankAccount));
      }
    } catch (error) {
      console.error('Erro ao carregar dados bancários:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePixKeys = async (newPixKeys: PixKey[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PIX_KEYS, JSON.stringify(newPixKeys));
      setPixKeys(newPixKeys);
    } catch (error) {
      console.error('Erro ao salvar chaves PIX:', error);
    }
  };

  const saveBankAccount = async (account: BankAccount | null) => {
    try {
      if (account) {
        await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNT, JSON.stringify(account));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.BANK_ACCOUNT);
      }
      setBankAccount(account);
    } catch (error) {
      console.error('Erro ao salvar conta bancária:', error);
    }
  };

  const updateBankAccount = useCallback((account: BankAccount) => {
    saveBankAccount(account);
  }, []);

  const addPixKey = useCallback((type: PixKeyType, key: string, isDefault: boolean = false) => {
    try {
      // Verifica se a chave já existe
      const keyExists = pixKeys.some(pk => pk.key.toLowerCase() === key.toLowerCase());
      if (keyExists) {
        return false;
      }

      const newPixKey: PixKey = {
        id: Date.now().toString(),
        type,
        key,
        isDefault,
        createdAt: new Date(),
      };

      const updatedKeys = isDefault
        ? [newPixKey, ...pixKeys.map(pk => ({ ...pk, isDefault: false }))]
        : [newPixKey, ...pixKeys];

      savePixKeys(updatedKeys);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar chave PIX:', error);
      return false;
    }
  }, [pixKeys]);

  const updatePixKey = useCallback((id: string, key: string) => {
    try {
      // Verifica se a nova chave já existe em outra entrada
      const keyExists = pixKeys.some(pk => pk.id !== id && pk.key.toLowerCase() === key.toLowerCase());
      if (keyExists) {
        return false;
      }

      const updatedKeys = pixKeys.map(pk => (pk.id === id ? { ...pk, key } : pk));
      savePixKeys(updatedKeys);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar chave PIX:', error);
      return false;
    }
  }, [pixKeys]);

  const deletePixKey = useCallback((id: string) => {
    try {
      const pixKey = pixKeys.find(pk => pk.id === id);
      
      // Não permite deletar se for a única chave
      if (pixKeys.length === 1) {
        return false;
      }

      let updatedKeys = pixKeys.filter(pk => pk.id !== id);
      
      // Se deletou a chave padrão, define a primeira como padrão
      if (pixKey?.isDefault && updatedKeys.length > 0) {
        updatedKeys[0].isDefault = true;
      }

      savePixKeys(updatedKeys);
      return true;
    } catch (error) {
      console.error('Erro ao deletar chave PIX:', error);
      return false;
    }
  }, [pixKeys]);

  const setDefaultPixKey = useCallback((id: string) => {
    const updatedKeys = pixKeys.map(pk => ({ ...pk, isDefault: pk.id === id }));
    savePixKeys(updatedKeys);
  }, [pixKeys]);

  const getPixKeyById = useCallback((id: string) => {
    return pixKeys.find(pk => pk.id === id);
  }, [pixKeys]);

  return (
    <BankContext.Provider
      value={{
        pixKeys,
        defaultPixKey,
        bankAccount,
        addPixKey,
        updatePixKey,
        deletePixKey,
        setDefaultPixKey,
        getPixKeyById,
        updateBankAccount,
        hasBankAccount,
        loading,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);

  if (!context) {
    throw new Error('useBank deve ser usado dentro de um BankProvider');
  }

  return context;
};