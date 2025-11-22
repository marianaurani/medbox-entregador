// src/contexts/WalletContext.tsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, WalletBalance, Earnings } from '../types';
import { mockTransactions, mockWalletBalance, mockEarnings } from '../utils/mockData';
import { useDelivery } from './DeliveryContext';

interface WalletContextData {
  balance: WalletBalance;
  transactions: Transaction[];
  earnings: Earnings;
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  withdraw: (amount: number, pixKey: string) => Promise<boolean>;
  getFilteredTransactions: (type?: string) => Transaction[];
  loading: boolean;
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData);

// Chaves para o AsyncStorage
const STORAGE_KEYS = {
  BALANCE: '@entregador:wallet:balance',
  TRANSACTIONS: '@entregador:wallet:transactions',
  EARNINGS: '@entregador:wallet:earnings',
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<WalletBalance>(mockWalletBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [earnings, setEarnings] = useState<Earnings>(mockEarnings);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  const { deliveries } = useDelivery();

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    loadStoredData();
  }, []);

  // Função para carregar dados do AsyncStorage
  const loadStoredData = async () => {
    try {
      const [storedBalance, storedTransactions, storedEarnings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.EARNINGS),
      ]);

      if (storedBalance) {
        setBalance(JSON.parse(storedBalance));
      }

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }

      if (storedEarnings) {
        setEarnings(JSON.parse(storedEarnings));
      }
    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar saldo
  const saveBalance = async (newBalance: WalletBalance) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(newBalance));
      setBalance(newBalance);
    } catch (error) {
      console.error('Erro ao salvar saldo:', error);
    }
  };

  // Função para salvar transações
  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
    }
  };

  // Função para salvar ganhos
  const saveEarnings = async (newEarnings: Earnings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(newEarnings));
      setEarnings(newEarnings);
    } catch (error) {
      console.error('Erro ao salvar ganhos:', error);
    }
  };

  // Atualiza ganhos quando houver entregas concluídas
  useEffect(() => {
    if (loading) return; // Não atualiza durante o carregamento inicial

    const completedDeliveries = deliveries.filter(d => d.status === 'entregue');
    
    // Calcula ganhos do dia
    const today = new Date();
    const todayDeliveries = completedDeliveries.filter(d => {
      if (!d.deliveredAt) return false;
      const deliveryDate = new Date(d.deliveredAt);
      return deliveryDate.toDateString() === today.toDateString();
    });

    const todayEarnings = todayDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);

    // Atualiza earnings
    const newEarnings: Earnings = {
      ...earnings,
      today: todayEarnings,
      deliveriesToday: todayDeliveries.length,
      routesCompleted: completedDeliveries.length,
    };
    saveEarnings(newEarnings);

    // Atualiza saldo disponível
    const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
    const newBalance: WalletBalance = {
      ...balance,
      available: balance.available + (totalEarnings - earnings.today),
      total: balance.total + (totalEarnings - earnings.today),
    };
    saveBalance(newBalance);
  }, [deliveries]);

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible(prev => !prev);
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    saveTransactions(updatedTransactions);

    // Atualiza saldo se a transação for concluída
    if (transaction.status === 'concluido') {
      const newBalance: WalletBalance = {
        ...balance,
        available: balance.available + transaction.amount,
        total: balance.total + transaction.amount,
      };
      saveBalance(newBalance);
    }
  }, [transactions, balance]);

  const withdraw = useCallback(async (amount: number, pixKey: string) => {
    try {
      // Simula chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Valida saldo
      if (amount > balance.available) {
        return false;
      }

      // Valida valor mínimo
      if (amount < 10) {
        return false;
      }

      // Cria transação de saque
      const newTransaction: Transaction = {
        type: 'saque',
        amount: -amount,
        description: `Saque via PIX - ${pixKey}`,
        status: 'concluido',
        id: Date.now().toString(),
        date: new Date(),
      };

      const updatedTransactions = [newTransaction, ...transactions];
      await saveTransactions(updatedTransactions);

      // Atualiza saldo
      const newBalance: WalletBalance = {
        ...balance,
        available: balance.available - amount,
        total: balance.total - amount,
      };
      await saveBalance(newBalance);

      return true;
    } catch (error) {
      console.error('Erro ao realizar saque:', error);
      return false;
    }
  }, [balance, transactions]);

  const getFilteredTransactions = useCallback((type?: string) => {
    if (!type || type === 'todas') {
      return transactions;
    }
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        earnings,
        isBalanceVisible,
        toggleBalanceVisibility,
        addTransaction,
        withdraw,
        getFilteredTransactions,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet deve ser usado dentro de um WalletProvider');
  }

  return context;
};