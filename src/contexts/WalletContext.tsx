// src/contexts/WalletContext.tsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
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
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<WalletBalance>(mockWalletBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [earnings, setEarnings] = useState<Earnings>(mockEarnings);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const { deliveries } = useDelivery();

  // Atualiza ganhos quando houver entregas concluídas
  useEffect(() => {
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
    setEarnings(prev => ({
      ...prev,
      today: todayEarnings,
      deliveriesToday: todayDeliveries.length,
      routesCompleted: completedDeliveries.length,
    }));

    // Atualiza saldo disponível
    const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
    setBalance(prev => ({
      ...prev,
      available: prev.available + (totalEarnings - mockEarnings.today), // Ajusta pela diferença
    }));
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

    setTransactions(prev => [newTransaction, ...prev]);

    // Atualiza saldo se a transação for concluída
    if (transaction.status === 'concluido') {
      setBalance(prev => ({
        ...prev,
        available: prev.available + transaction.amount,
        total: prev.total + transaction.amount,
      }));
    }
  }, []);

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
      addTransaction({
        type: 'saque',
        amount: -amount,
        description: `Saque via PIX - ${pixKey}`,
        status: 'concluido',
      });

      // Atualiza saldo
      setBalance(prev => ({
        ...prev,
        available: prev.available - amount,
        total: prev.total - amount,
      }));

      return true;
    } catch (error) {
      console.error('Erro ao realizar saque:', error);
      return false;
    }
  }, [balance.available, addTransaction]);

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