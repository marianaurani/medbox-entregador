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
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  withdraw: (amount: number, pixKey: string) => Promise<boolean>;
  getFilteredTransactions: (type?: string) => Transaction[];
  getTransactionById: (id: string) => Transaction | undefined;
  loading: boolean;
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData);

const STORAGE_KEYS = {
  BALANCE: '@entregador:wallet:balance',
  TRANSACTIONS: '@entregador:wallet:transactions',
  EARNINGS: '@entregador:wallet:earnings',
  PROCESSED_DELIVERIES: '@entregador:wallet:processedDeliveries',
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<WalletBalance>(mockWalletBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [earnings, setEarnings] = useState<Earnings>(mockEarnings);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processedDeliveries, setProcessedDeliveries] = useState<Set<string>>(new Set());

  const { deliveries } = useDelivery();

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedBalance, storedTransactions, storedEarnings, storedProcessed] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.EARNINGS),
        AsyncStorage.getItem(STORAGE_KEYS.PROCESSED_DELIVERIES),
      ]);

      if (storedBalance) {
        setBalance(JSON.parse(storedBalance));
      }

      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions);
        const withDates = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        setTransactions(withDates);
      }

      if (storedEarnings) {
        setEarnings(JSON.parse(storedEarnings));
      }

      if (storedProcessed) {
        setProcessedDeliveries(new Set(JSON.parse(storedProcessed)));
      }
    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBalance = async (newBalance: WalletBalance) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(newBalance));
      setBalance(newBalance);
    } catch (error) {
      console.error('Erro ao salvar saldo:', error);
    }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
    }
  };

  const saveEarnings = async (newEarnings: Earnings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(newEarnings));
      setEarnings(newEarnings);
    } catch (error) {
      console.error('Erro ao salvar ganhos:', error);
    }
  };

  const saveProcessedDeliveries = async (processed: Set<string>) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PROCESSED_DELIVERIES,
        JSON.stringify(Array.from(processed))
      );
      setProcessedDeliveries(processed);
    } catch (error) {
      console.error('Erro ao salvar deliveries processadas:', error);
    }
  };

  // ✅ MONITORA ENTREGAS CONCLUÍDAS E CRIA TRANSAÇÕES AUTOMATICAMENTE
  useEffect(() => {
    if (loading) return;

    const completedDeliveries = deliveries.filter(d => d.status === 'entregue');

    completedDeliveries.forEach(async (delivery) => {
      if (processedDeliveries.has(delivery.id)) {
        return;
      }

      // Cria transação automaticamente
      const newTransaction: Transaction = {
        id: `tx_${delivery.id}_${Date.now()}`,
        type: 'entrega',
        amount: delivery.deliveryFee,
        description: `Entrega #${delivery.orderId} - ${delivery.customer.name}`,
        date: delivery.deliveredAt || new Date(),
        status: 'concluido',
        deliveryId: delivery.id,
      };

      const updatedTransactions = [newTransaction, ...transactions];
      await saveTransactions(updatedTransactions);

      const newProcessed = new Set(processedDeliveries);
      newProcessed.add(delivery.id);
      await saveProcessedDeliveries(newProcessed);

      console.log('✅ Transação criada automaticamente:', newTransaction.id);
    });

    // Atualiza ganhos
    const today = new Date();
    const todayDeliveries = completedDeliveries.filter(d => {
      if (!d.deliveredAt) return false;
      const deliveryDate = new Date(d.deliveredAt);
      return deliveryDate.toDateString() === today.toDateString();
    });

    const todayEarnings = todayDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);

    const newEarnings: Earnings = {
      ...earnings,
      today: todayEarnings,
      deliveriesToday: todayDeliveries.length,
      routesCompleted: completedDeliveries.length,
    };
    saveEarnings(newEarnings);

    // Atualiza saldo disponível
    const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
    const withdrawnAmount = transactions
      .filter(t => t.type === 'saque' && t.status === 'concluido')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const newBalance: WalletBalance = {
      available: totalEarnings - withdrawnAmount,
      pending: 0,
      total: totalEarnings - withdrawnAmount,
    };
    saveBalance(newBalance);
  }, [deliveries, loading]);

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible(prev => !prev);
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}`,
      date: new Date(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    await saveTransactions(updatedTransactions);

    if (transaction.status === 'concluido') {
      const newBalance: WalletBalance = {
        ...balance,
        available: balance.available + transaction.amount,
        total: balance.total + transaction.amount,
      };
      await saveBalance(newBalance);
    }
  }, [transactions, balance]);

  const withdraw = useCallback(async (amount: number, pixKey: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (amount > balance.available) {
        return false;
      }

      if (amount < 10) {
        return false;
      }

      await addTransaction({
        type: 'saque',
        amount: -amount,
        description: `Saque via PIX - ${pixKey}`,
        status: 'concluido',
      });

      return true;
    } catch (error) {
      console.error('Erro ao realizar saque:', error);
      return false;
    }
  }, [balance, addTransaction]);

  const getFilteredTransactions = useCallback((type?: string) => {
    if (!type || type === 'todas') {
      return transactions;
    }
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
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
        getTransactionById,
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