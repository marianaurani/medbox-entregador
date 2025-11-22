// src/contexts/BankContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';

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
}

const BankContext = createContext<BankContextData>({} as BankContextData);

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

  const defaultPixKey = pixKeys.find(pk => pk.isDefault) || null;
  const hasBankAccount = !!bankAccount;

  const updateBankAccount = useCallback((account: BankAccount) => {
    setBankAccount(account);
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

      setPixKeys(prev => {
        // Se a nova chave for padrão, remove o padrão das outras
        if (isDefault) {
          return [newPixKey, ...prev.map(pk => ({ ...pk, isDefault: false }))];
        }
        return [newPixKey, ...prev];
      });

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

      setPixKeys(prev =>
        prev.map(pk => (pk.id === id ? { ...pk, key } : pk))
      );

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

      setPixKeys(prev => {
        const updated = prev.filter(pk => pk.id !== id);
        
        // Se deletou a chave padrão, define a primeira como padrão
        if (pixKey?.isDefault && updated.length > 0) {
          updated[0].isDefault = true;
        }
        
        return updated;
      });

      return true;
    } catch (error) {
      console.error('Erro ao deletar chave PIX:', error);
      return false;
    }
  }, [pixKeys]);

  const setDefaultPixKey = useCallback((id: string) => {
    setPixKeys(prev =>
      prev.map(pk => ({ ...pk, isDefault: pk.id === id }))
    );
  }, []);

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